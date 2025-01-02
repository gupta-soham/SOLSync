"use client";

import { NetworkSelector } from "@/components/NetworkSelector";
import AccountTab from "@/components/tabs/account-tab";
import CreateTokenTab from "@/components/tabs/create-token-tab";
import SwapTab from "@/components/tabs/swap-tab";
import { Card } from "@/components/ui/card";
import { GeometricBackground } from "@/components/ui/geometric-background";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface ClientContentProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  tabs: Tab[];
}

export function ClientContent({
  activeTab,
  setActiveTab,
  tabs,
}: ClientContentProps) {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <GeometricBackground />
        <Card className="w-full max-w-lg p-4 md:p-8 neo-card border-[#FF007F] text-center bg-gray-50 backdrop-blur-sm bg-opacity-30 rounded-xl">
          <h1 className="text-4xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight">
            SOL<span className="text-[#FF007F]">Sync</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
            Sync seamlessly with Solana to manage tokens, swaps, and accounts.
          </p>
          <WalletMultiButton className="w-full neo-button h-12 md:h-16 text-base md:text-lg !bg-[#FFE600] !text-black hover:!bg-[#14F195]" />

          <div className="mt-4 md:mt-6">
            <span className="text-gray-800 font-medium">
              Don&apos;t have a wallet?{" "}
            </span>
            <Link
              href="https://walletweb3.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-black underline-offset-4 decoration-2 hover:text-[#FF007F] hover:underline transition-all"
            >
              Get Wallet →
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <GeometricBackground />
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            SOL<span className="text-[#FF007F]">Sync</span>
          </h1>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4">
            <NetworkSelector />
            <WalletMultiButton className="neo-button h-12 !bg-[#FFE600] !text-black hover:!bg-[#14F195]" />
          </div>
        </div>

        <Tabs
          defaultValue="account"
          className="space-y-6 md:space-y-8"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid grid-cols-3 gap-2 md:gap-6 bg-transparent h-auto p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`neo-brutalism-tab group relative py-4 md:py-8 text-base md:text-xl font-black rounded-none transition-all transform hover:-translate-y-1 hover:translate-x-1
                  ${
                    activeTab === tab.id
                      ? "bg-[#14F195] text-black border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-[#E6E6E6] text-gray-800 border-[6px] border-black hover:bg-[#FFD700] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon
                    className={cn(
                      `h-4 w-4 md:h-6 md:w-6 transition-transform group-hover:scale-110 ${
                        activeTab === tab.id ? "text-black" : "text-gray-800"
                      }`
                    )}
                  />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label.split(" ")[0]}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="account"
            className="p-4 md:p-6 border-2 border-gray-200 bg-gray-50 backdrop-blur-sm bg-opacity-30 rounded-lg"
          >
            <AccountTab />
          </TabsContent>

          <TabsContent
            value="create"
            className="p-4 md:p-6 border-2 border-gray-200 bg-gray-50 backdrop-blur-sm bg-opacity-30 rounded-lg"
          >
            <CreateTokenTab />
          </TabsContent>

          <TabsContent
            value="swap"
            className="p-4 md:p-6 border-2 border-gray-200 bg-gray-50 backdrop-blur-sm bg-opacity-30 rounded-lg"
          >
            <SwapTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
