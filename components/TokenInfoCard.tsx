"use client";

import { Card } from "@/components/ui/card";
import { useNetwork } from "@/contexts/NetworkContext";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TokenInfoCardProps {
  mintAddress: string;
  balance: string;
  symbol: string;
}

export function TokenInfoCard({
  mintAddress,
  balance,
  symbol,
}: TokenInfoCardProps) {
  const { network } = useNetwork();
  const [isDevnet, setIsDevnet] = useState(false);

  useEffect(() => {
    setIsDevnet(network === "devnet");
  }, [network]);

  return (
    <Card className="p-6 neo-brutalist-card bg-[#14F195] text-black border-4 border-black rounded-none shadow-[4px_4px_0px_#000] hover:shadow-[8px_8px_0px_#000]">
      <h3 className="text-3xl font-black mb-4 uppercase text-center underline">
        Token Created Successfully
      </h3>
      <div className="space-y-4">
        <p className="font-bold flex items-center gap-2">
          <span className="uppercase bg-black text-white px-2 py-1">
            Token Mint:
          </span>
          <Link
            className="font-mono hover:underline hover:text-blue-800"
            href={`https://solscan.io/account/${mintAddress.toString()}${
              isDevnet ? "?cluster=devnet" : ""
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {mintAddress}
          </Link>
        </p>
        <p className="font-bold flex items-center gap-2">
          <span className="uppercase bg-black text-white px-2 py-1">
            Balance:
          </span>
          {balance} {symbol}
        </p>
      </div>
    </Card>
  );
}
