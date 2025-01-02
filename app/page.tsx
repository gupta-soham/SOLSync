"use client";

import { ClientContent, Tab } from "@/components/ClientContent";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { ArrowLeftRight, Coins, WalletIcon } from "lucide-react";
import { useMemo, useState } from "react";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function Home() {
  const [activeTab, setActiveTab] = useState("account");

  const tabs: Tab[] = [
    { id: "account", label: "Account", icon: WalletIcon },
    { id: "create", label: "Create Token", icon: Coins },
    { id: "swap", label: "Swap", icon: ArrowLeftRight },
  ];

  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ClientContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
