"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showNeoBrutalistErrorToast } from "@/components/ui/neo-brutalist-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchSOLBalance, fetchTokens, Token } from "@/lib/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AlertCircle, ArrowDownUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function SwapTab() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [balance, setBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Memoize the connection so that it doesn't re-render on every state change
  // const connection = useMemo(() => new Connection(endpoint), [endpoint]);

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT;

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) return;

      try {
        const [solBalance, tokens] = await Promise.all([
          fetchSOLBalance(connection, publicKey),
          fetchTokens(connection, publicKey),
        ]);

        setBalance(solBalance);
        setTokenList(tokens);
      } catch (error) {
        showNeoBrutalistErrorToast("Failed to fetch Tokens");
      }
    };
    fetchBalances();
  }, [connection, publicKey]);

  const handleSwap = useCallback(() => {
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setFromToken(toToken);
    setToToken(fromToken);
  }, [fromAmount, toAmount, fromToken, toToken]);

  const calculateFee = useMemo(() => {
    const amount = parseFloat(fromAmount);
    return isNaN(amount) ? 0 : amount * 0.008;
  }, [fromAmount]);

  const slippageButtons = useMemo(
    () =>
      ["0.5", "0.8", "1"].map((value) => (
        <Button
          key={value}
          onClick={() => setSlippage(value)}
          className={`flex-1 h-16 text-xl font-bold ${
            slippage === value
              ? "bg-[#14F195] text-black"
              : "bg-white text-black"
          } border-4 border-black hover:bg-[#FFE600] transition-all duration-300`}
        >
          {value}%
        </Button>
      )),
    [slippage]
  );

  return (
    <Card className="p-4 sm:p-8 neo-brutalist-card relative overflow-hidden">
      <div className="geometric-circle bg-[#FF007F] w-32 h-32 -top-16 -left-16 blur-sm"></div>
      <div className="geometric-triangle bg-[#00F0FF] w-32 h-32 -bottom-5 -right-5 blur-xl"></div>

      <h2 className="text-4xl font-black mb-8 uppercase">Swap Tokens</h2>

      <div className="space-y-8">
        <div className="space-y-4">
          <Label className="text-2xl font-black uppercase">From</Label>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 input-neo h-12 sm:h-16 text-lg sm:text-xl"
            />
            <Select value={fromToken} onValueChange={setFromToken}>
              <SelectTrigger className="w-full sm:w-[180px] select-neo h-12 sm:h-16 text-lg sm:text-xl">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="border-4 border-black">
                {tokenList.map((token) => (
                  <SelectItem key={token.mint.toString()} value={token.symbol}>
                    {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-lg font-bold">Balance: {balance.toFixed(4)} SOL</p>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-16 w-16 border-4 border-black hover:bg-[#FFE600] transition-all duration-300"
            onClick={handleSwap}
          >
            <ArrowDownUp className="h-8 w-8" />
          </Button>
        </div>

        <div className="space-y-4">
          <Label className="text-2xl font-black uppercase">To</Label>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="number"
              placeholder="0.00"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="flex-1 input-neo h-12 sm:h-16 text-lg sm:text-xl"
            />
            <Select value={toToken} onValueChange={setToToken}>
              <SelectTrigger className="w-full sm:w-[180px] select-neo h-12 sm:h-16 text-lg sm:text-xl">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="border-4 border-black">
                {tokenList.map((token) => (
                  <SelectItem key={token.mint.toString()} value={token.symbol}>
                    {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-2xl font-black uppercase">
            Slippage Tolerance
          </Label>
          <div className="flex flex-wrap gap-2 sm:gap-4">{slippageButtons}</div>
        </div>

        <div className="p-6 bg-white rounded-none border-4 border-black space-y-4">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-600">Exchange Rate</span>
            <span>
              1 {fromToken || "TOKEN"} = {toAmount || "0.00"}{" "}
              {toToken || "TOKEN"}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-600">Network Fee</span>
            <span>~0.00005 SOL</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-600">Swap Fee (0.8%)</span>
            <span>{calculateFee.toFixed(4)} SOL</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-[#FF007F]" />
            <span>0.8% fee will be sent to the creator</span>
          </div>
        </div>
        <Button
          className="w-full neo-brutalist-button text-xl sm:text-2xl py-4 sm:py-6"
          onClick={() => setShowModal(true)}
        >
          Review Swap
        </Button>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="border-4 border-[#FF007F] bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">
                Coming Soon!
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <AlertCircle className="h-16 w-16 text-[#FF007F]" />
              <p className="text-xl font-bold text-center">
                Swap functionality is under development and will be launched
                soon!
              </p>
            </div>
            <Button
              className="neo-brutalist-button w-full text-xl"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
