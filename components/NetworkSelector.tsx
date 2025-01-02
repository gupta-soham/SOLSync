"use client";

import { useNetwork } from '@/contexts/NetworkContext';

export function NetworkSelector() {
  const { network, setNetwork } = useNetwork();

  return (
    <select
      value={network}
      onChange={(e) => setNetwork(e.target.value as 'mainnet-beta' | 'devnet')}
      className="h-12 px-4 border-4 border-black rounded-none font-bold bg-white hover:bg-[#FFE600] transition-colors"
    >
      <option value="mainnet-beta">Mainnet</option>
      <option value="devnet">Devnet</option>
    </select>
  );
}