"use client";

import { TokenInfoCard } from "@/components/TokenInfoCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  showNeoBrutalistErrorToast,
  showNeoBrutalistSuccessToast,
} from "@/components/ui/neo-brutalist-toast";
import { Switch } from "@/components/ui/switch";
import { useNetwork } from "@/contexts/NetworkContext";
import { uploadMetadata } from "@/lib/utils";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { AlertCircle, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export default function CreateTokenTab() {
  const [decimalsValue, setDecimalsValue] = useState(9);
  const [inputValue, setInputValue] = useState("9");
  const [imageUrl, setImageUrl] = useState("");
  const [freezeAuthority, setFreezeAuthority] = useState(true);
  const [mintAuthority, setMintAuthority] = useState(true);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [creationState, setCreationState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [tokenInfo, setTokenInfo] = useState<{
    mintAddress: string;
    balance: string;
    symbol: string;
  } | null>(null);

  const { network } = useNetwork();
  const { connection } = useConnection();
  const { wallet } = useWallet();

  const FEE_AMOUNT = 0.05 * LAMPORTS_PER_SOL;
  const FEE_RECIPIENT = new PublicKey(process.env.NEXT_PUBLIC_FEE_RECIPIENT!);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      setDecimalsValue(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isNaN(Number(inputValue))) {
      setDecimalsValue(Number(inputValue));
    }
  };

  // Create token on Solana blockchain
  async function createToken() {
    if (!wallet || !wallet.adapter.publicKey) {
      showNeoBrutalistErrorToast(
        "Wallet is not connected or publicKey is not available."
      );
      return;
    }

    if (network === "mainnet-beta") {
      const confirm = window.confirm(
        "You are about to create a token on mainnet. This will cost 0.05 SOL + transaction fees. Are you sure you want to continue?"
      );

      if (!confirm) {
        setIsCreating(false);
        setCreationState("idle");
        return;
      }
    }

    // Upload metadata first
    setStatus("Uploading metadata...");
    let metadataUrl;
    try {
      const result = await uploadMetadata(
        tokenName,
        tokenSymbol,
        tokenDescription,
        imageUrl,
        network,
        decimalsValue
      );
      metadataUrl = result;
    } catch (error) {
      console.error("Error uploading metadata:", error);
      showNeoBrutalistErrorToast("Failed to upload token metadata!");
      setCreationState("error");
      return;
    }

    setStatus("Creating Mint Account...");
    const mintKeypair = Keypair.generate();

    const metadata: TokenMetadata = {
      mint: mintKeypair.publicKey,
      name: tokenName,
      symbol: tokenSymbol,
      uri: metadataUrl,
      additionalMetadata: [],
    };

    // Calculate the minimum balance required for the mint account
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    // Create the fee transfer instruction
    const feeTransferInstruction = SystemProgram.transfer({
      fromPubkey: wallet.adapter.publicKey,
      toPubkey: FEE_RECIPIENT,
      lamports: FEE_AMOUNT,
    });

    // Create the mint account
    const transaction = new Transaction().add(feeTransferInstruction).add(
      SystemProgram.createAccount({
        fromPubkey: wallet.adapter.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        wallet.adapter.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimalsValue,
        wallet.adapter.publicKey,
        freezeAuthority ? wallet.adapter.publicKey : null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.adapter.publicKey,
        updateAuthority: wallet.adapter.publicKey,
      })
    );

    setStatus("Creating Token...");
    transaction.feePayer = wallet.adapter.publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(mintKeypair);

    try {
      await wallet.adapter.sendTransaction(transaction, connection);
    } catch (error) {
      setCreationState("error");
      showNeoBrutalistErrorToast("Failed to create token");
      return;
    }

    setStatus("Associating the Account...");

    // Create the associated token account
    const associatedTokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.adapter.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const associateTransaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.adapter.publicKey,
        associatedTokenAccount,
        wallet.adapter.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    associateTransaction.feePayer = wallet.adapter.publicKey;
    associateTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    try {
      await wallet.adapter.sendTransaction(associateTransaction, connection);
    } catch (error) {
      setCreationState("error");
      showNeoBrutalistErrorToast("Failed to associate token account");
      return;
    }

    // Mint the tokens
    setStatus("Minting the Tokens...");
    const mintInstruction = createMintToInstruction(
      mintKeypair.publicKey,
      associatedTokenAccount,
      wallet.adapter.publicKey,
      Number(initialSupply) * Math.pow(10, decimalsValue),
      [],
      TOKEN_2022_PROGRAM_ID
    );

    // Create the mint transaction
    const tokenMintTransaction = new Transaction().add(mintInstruction);
    tokenMintTransaction.feePayer = wallet.adapter.publicKey;
    tokenMintTransaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    try {
      await wallet.adapter.sendTransaction(tokenMintTransaction, connection);
      setCreationState("success");
      setTokenInfo({
        mintAddress: mintKeypair.publicKey.toBase58(),
        balance: initialSupply,
        symbol: tokenSymbol,
      });
      showNeoBrutalistSuccessToast(`Token created successfully on ${network}!`);
    } catch (error) {
      setCreationState("error");
      showNeoBrutalistErrorToast("Failed to mint tokens");
    }
  }

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreationState("loading");
    await createToken();
  };

  return (
    <Card className="p-4 sm:p-8 neo-brutalist-card relative overflow-hidden">
      <div className="geometric-circle bg-[#FF007F] w-32 h-32 -top-16 -left-16 blur-sm"></div>
      <div className="geometric-triangle bg-[#00F0FF] w-32 h-32 -bottom-5 -right-5 blur-xl"></div>

      <h2 className="text-4xl font-black mb-8 uppercase">Create New Token</h2>

      {isCreating ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          {creationState === "loading" && (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-[#FF007F]" />
              <p className="text-xl font-bold">{status}</p>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-[#FF007F]" />
                <span>0.05 SOL will be sent to the creator</span>
              </div>
            </>
          )}
          {creationState === "success" && tokenInfo && (
            <TokenInfoCard
              mintAddress={tokenInfo.mintAddress}
              balance={tokenInfo.balance}
              symbol={tokenInfo.symbol}
            />
          )}
          {creationState === "error" && (
            <>
              <AlertCircle className="w-16 h-16 text-red-500" />
              <p className="text-xl font-bold">Error Creating Token</p>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleCreateToken} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xl font-black uppercase">
              Token Name
            </Label>
            <Input
              id="name"
              placeholder="My Token"
              className="input-neo h-12 sm:h-16 text-lg sm:text-xl"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol" className="text-xl font-black uppercase">
              Token Symbol
            </Label>
            <Input
              id="symbol"
              placeholder="TKN"
              className="input-neo h-12 sm:h-16 text-lg sm:text-xl"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-xl font-black uppercase">
              Token Image URL
            </Label>
            <div className="grid grid-cols-[1fr,auto] gap-4">
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.png"
                className="input-neo h-12 sm:h-16 text-lg sm:text-xl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <div className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center rounded-full">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    width={50}
                    height={50}
                    alt="Token Image"
                    className="rounded-full aspect-square object-cover"
                    onError={() => setImageUrl("")}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xl font-black uppercase"
            >
              Token Description
            </Label>
            <Input
              id="description"
              placeholder="Describe your token (optional)"
              className="input-neo h-12 sm:h-16 text-lg sm:text-xl"
              value={tokenDescription}
              onChange={(e) => setTokenDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supply" className="text-xl font-black uppercase">
              Initial Supply
            </Label>
            <Input
              id="supply"
              type="number"
              placeholder="1000000"
              className="input-neo h-12 sm:h-16 text-lg sm:text-xl"
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="decimals" className="text-xl font-black uppercase">
              Decimals
            </Label>
            <div className="flex items-center gap-4 bg-white p-6 rounded-none border-4 border-black">
              <Input
                id="decimals"
                type="range"
                min="0"
                max="9"
                step="1"
                value={decimalsValue}
                onChange={handleSliderChange}
                className="w-full h-4 appearance-none bg-[#FFE600] border-4 border-black cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#FFE600] [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="relative group">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-20 px-2 py-1 text-right font-mono text-2xl bg-white border-4 border-black focus:outline-none focus:ring-4 focus:ring-[#14F195]"
                  aria-label="Decimals value"
                />
                <div className="invisible group-hover:visible absolute right-0 translate-x-full -translate-y-1/2 top-1/2 ml-2 px-2 py-1 bg-black text-white text-sm whitespace-nowrap">
                  Press Enter to confirm
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-2xl uppercase">Authorities</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-center justify-between p-6 bg-white rounded-none border-4 border-black">
                <div className="space-y-1">
                  <Label className="text-xl font-black uppercase">
                    Freeze Authority
                  </Label>
                  <p className="text-sm font-bold">
                    Ability to freeze token accounts
                  </p>
                </div>
                <Switch
                  checked={freezeAuthority}
                  onCheckedChange={setFreezeAuthority}
                  className="data-[state=checked]:bg-[#14F195] w-14 h-8 border-4 border-black"
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-white rounded-none border-4 border-black">
                <div className="space-y-1">
                  <Label className="text-xl font-black uppercase">
                    Mint Authority
                  </Label>
                  <p className="text-sm font-bold">
                    Ability to mint new tokens
                  </p>
                </div>
                <Switch
                  checked={mintAuthority}
                  onCheckedChange={setMintAuthority}
                  className="data-[state=checked]:bg-[#14F195] w-14 h-8 border-4 border-black"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full neo-brutalist-button text-xl sm:text-2xl py-4 sm:py-6"
          >
            CREATE TOKEN
          </Button>
        </form>
      )}
    </Card>
  );
}
