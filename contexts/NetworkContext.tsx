"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { clusterApiUrl } from "@solana/web3.js";

type Network = "mainnet-beta" | "devnet";

interface NetworkContextType {
  network: Network;
  endpoint: string;
  setNetwork: (network: Network) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>("devnet");
  const endpoint = clusterApiUrl(network);

  return (
    <NetworkContext.Provider value={{ network, endpoint, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
