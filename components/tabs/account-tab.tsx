import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  showNeoBrutalistErrorToast,
  showNeoBrutalistSuccessToast,
} from "@/components/ui/neo-brutalist-toast";
import { useNetwork } from "@/contexts/NetworkContext";
import { fetchSOLBalance, fetchTokens, type Token } from "@/lib/utils";
import {
  createMintToInstruction,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { Coins, Copy, ExternalLink, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiSolana } from "react-icons/si";

interface MintStatus {
  [key: string]: "minting" | "success" | "error" | undefined;
}

export default function AccountTab() {
  const { network, endpoint } = useNetwork();
  const { publicKey, disconnect, sendTransaction } = useWallet();
  const [isDevnet, setIsDevnet] = useState(false);
  const [balance, setBalance] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintStatus, setMintStatus] = useState<MintStatus>({});
  const [mintAmounts, setMintAmounts] = useState<{ [key: string]: string }>({});

  const connection = new Connection(endpoint);

  useEffect(() => {
    setIsDevnet(network === "devnet");
  }, [network]);

  useEffect(() => {
    if (!publicKey) return;
    fetchBalances();
  }, [publicKey, network]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const [solBalance, tokenData] = await Promise.all([
        fetchSOLBalance(connection, publicKey as PublicKey),
        fetchTokens(connection, publicKey as PublicKey),
      ]);

      setBalance(solBalance);
      setTokens(tokenData);
    } catch (error) {
      showNeoBrutalistErrorToast("Failed to fetch balances");
    } finally {
      setLoading(false);
    }
  };

  const mintTokens = async (mintAddress: PublicKey, amount: string) => {
    if (!publicKey || !amount) return;

    setMintStatus((prev) => ({
      ...prev,
      [mintAddress.toString()]: "minting",
    }));

    try {
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const mintTransaction = new Transaction().add(
        createMintToInstruction(
          mintAddress,
          associatedTokenAccount,
          publicKey,
          parseInt(amount) * 1000000000,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      await sendTransaction(mintTransaction, connection);
      await fetchBalances();
      showNeoBrutalistSuccessToast("Token minted successfully!");
      setMintStatus((prev) => ({
        ...prev,
        [mintAddress.toString()]: "success",
      }));
      setMintAmounts({});
    } catch (error) {
      showNeoBrutalistErrorToast("Failed to mint tokens");
      setMintStatus((prev) => ({
        ...prev,
        [mintAddress.toString()]: "error",
      }));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 border border-black rounded-none relative overflow-hidden">
      <div className="geometric-circle bg-[#FFE600] w-24 sm:w-36 h-24 sm:h-36 -top-12 sm:-top-20 -left-12 sm:-left-20 blur-sm"></div>
      <div className="geometric-triangle bg-[#00F0FF] w-24 sm:w-32 h-24 sm:h-32 -bottom-3 sm:-bottom-5 -right-3 sm:-right-5 blur-xl"></div>

      <Card className="p-4 sm:p-6 neo-brutalist-card border-[#FF007F] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
            Wallet Details
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            {isDevnet && (
              <Button
                variant="outline"
                size="lg"
                className="neo-brutalist-button bg-[#14F195] text-black font-black uppercase text-base sm:text-xl py-3 sm:py-6 px-4 sm:px-8 w-full sm:w-auto"
                onClick={async () => {
                  try {
                    const signature = await connection.requestAirdrop(
                      publicKey as PublicKey,
                      5 * LAMPORTS_PER_SOL
                    );
                    await connection.confirmTransaction(signature);
                    showNeoBrutalistSuccessToast(
                      "Airdrop successful! Received 5 SOL"
                    );
                    await fetchBalances();
                  } catch (error) {
                    showNeoBrutalistErrorToast("Failed to request airdrop");
                  }
                }}
              >
                Airdrop 5 SOL
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              className="neo-brutalist-button bg-[#FFE600] text-black font-black uppercase text-base sm:text-xl py-3 sm:py-6 px-4 sm:px-8 w-full sm:w-auto"
              onClick={disconnect}
            >
              Disconnect
            </Button>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-white rounded-none border-4 border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000]">
            <span className="text-xl sm:text-2xl font-black uppercase mb-2 sm:mb-0">
              Address
            </span>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <code className="font-bold text-base sm:text-2xl break-all sm:break-normal">
                {publicKey
                  ? `${publicKey.toString().slice(0, 4)}...${publicKey
                      .toString()
                      .slice(-4)}`
                  : ""}
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="hover:text-[#14F195] rounded-none p-1 sm:p-2"
                onClick={() => {
                  if (publicKey) {
                    navigator.clipboard.writeText(publicKey.toString());
                    showNeoBrutalistSuccessToast("Address copied to clipboard");
                  }
                }}
              >
                <Copy className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <Link
                className="hover:bg-[#00F0FF] p-1 sm:p-2 rounded-none inline-flex items-center border-2 border-black"
                href={`https://solscan.io/account/${publicKey?.toString()}${
                  isDevnet ? "?cluster=devnet" : ""
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 sm:h-6 sm:w-6" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 sm:p-6 bg-white rounded-none border-4 border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000]">
              <div className="flex items-center gap-3 sm:gap-4">
                <SiSolana className="h-8 w-8 sm:h-12 sm:w-12 text-[#14F195]" />
                <div>
                  <p className="font-black text-2xl sm:text-3xl">SOL</p>
                  <p className="text-lg sm:text-xl uppercase font-bold">
                    Solana
                  </p>
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-black">
                {balance.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6 neo-brutalist-card border-[#14F195] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-wide">
              Token Balances
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-[#FF007F] rounded-none p-1 sm:p-2"
              onClick={fetchBalances}
              disabled={loading}
            >
              <RefreshCw
                className={`h-6 w-6 sm:h-8 sm:w-8 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {tokens.map((token) => (
            <div
              key={token.pubkey}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-white rounded-none border-4 border-black shadow-[4px_4px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000]"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-0">
                {token.logo ? (
                  <Image
                    src={token.logo}
                    alt={token.symbol}
                    width={48}
                    height={48}
                    className="rounded-full aspect-square object-cover border-2 border-black w-10 h-10 sm:w-12 sm:h-12"
                  />
                ) : (
                  <Coins className="h-10 w-10 sm:h-12 sm:w-12 text-[#14F195]" />
                )}

                <div>
                  <p className="font-black text-xl sm:text-2xl group">
                    <Link
                      className="hover:text-[#00F0FF] inline-flex items-center gap-2 transition-colors"
                      href={`https://solscan.io/account/${token.mint.toString()}${
                        isDevnet ? "?cluster=devnet" : ""
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {token.name}
                      <ExternalLink className="h-4 w-4 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </p>
                  <p className="text-lg sm:text-xl uppercase font-bold">
                    {token.symbol}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full sm:w-auto">
                <p className="text-2xl sm:text-3xl font-black">
                  {(parseInt(token.amount) / 1000000000).toFixed(2)}
                </p>
                {isDevnet && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <Input
                      type="number"
                      className="w-full sm:w-32 p-2 sm:p-3 border-4 border-black text-lg sm:text-xl font-bold focus:border-[#FF007F] transition-all"
                      placeholder="Amount"
                      value={mintAmounts[token.mint.toString()] || ""}
                      onChange={(e) => {
                        setMintAmounts({
                          ...mintAmounts,
                          [token.mint.toString()]: e.target.value,
                        });
                      }}
                    />
                    <Button
                      className="w-full sm:w-auto neo-brutalist-button bg-[#FFE600] text-black font-black uppercase text-base sm:text-xl py-2 sm:py-4 px-4 sm:px-6"
                      onClick={() =>
                        mintTokens(
                          token.mint,
                          mintAmounts[token.mint.toString()]
                        )
                      }
                      disabled={mintStatus[token.mint.toString()] === "minting"}
                    >
                      {mintStatus[token.mint.toString()] === "minting"
                        ? "Minting..."
                        : "Mint"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
