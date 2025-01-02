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
import { showNeoBrutalistErrorToast } from "@/components/ui/neo-brutalist-toast";
import { WalletError } from "@solana/wallet-adapter-base";

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
      <WalletProvider wallets={wallets} autoConnect onError={handleWalletError}>
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

function handleWalletError(error: WalletError | Error) {
  console.error("Wallet error:", error);

  if ("code" in error) {
    switch (error.code) {
      case -32603:
        showNeoBrutalistErrorToast(
          "Unable to connect to wallet. Please make sure your wallet is unlocked and try again."
        );
        break;
      case 4001:
        showNeoBrutalistErrorToast("Connection rejected by user");
        break;
      default:
        showNeoBrutalistErrorToast(
          `Wallet error: ${error.message || "Unknown error"}`
        );
    }
  } else {
    showNeoBrutalistErrorToast(error.message || "An unknown error occurred");
  }
}
