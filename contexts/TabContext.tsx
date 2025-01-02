import React, { createContext, useContext, useState, ReactNode } from "react";
import { WalletIcon, Coins, ArrowLeftRight } from "lucide-react";

// Define the Tab interface
export interface Tab {
  id: string;
  label: string;
  icon: React.FC;
}

// Define the context type
interface TabContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
  tabs: Tab[];
}

// Create the context
const TabContext = createContext<TabContextType | undefined>(undefined);

// Define props for the provider component
interface TabProviderProps {
  children: ReactNode;
}

// Create the provider component
export function TabProvider({ children }: TabProviderProps) {
  const [activeTab, setActiveTab] = useState("account");

  const tabs: Tab[] = [
    { id: "account", label: "Account", icon: WalletIcon },
    { id: "create", label: "Create Token", icon: Coins },
    { id: "swap", label: "Swap", icon: ArrowLeftRight },
  ];

  const value = {
    activeTab,
    setActiveTab,
    tabs,
  };

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}

// Create a custom hook to use the tab context
export function useTab() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error("useTab must be used within a TabProvider");
  }
  return context;
}
