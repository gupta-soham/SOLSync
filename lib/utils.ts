import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import {
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export interface Token {
  pubkey: string;
  mint: PublicKey;
  amount: string;
  logo: string | undefined;
  name: string;
  symbol: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

async function fetchTokenMetadataFromUri(uri: string) {
  try {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const response = await fetch(encodeURIComponent(uri).startsWith('http') ? `${proxyUrl}${encodeURIComponent(uri)}` : uri);
    const data = await response.json();

    const metadata = typeof data.contents === 'string' ? JSON.parse(data.contents) : data;

    const imageUrl = metadata.image || metadata.image_url || metadata.imageUrl || metadata.imageURI;

    if (!imageUrl) {
      console.warn('No image URL found in metadata:', metadata);
      return null;
    }

    if (imageUrl.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${imageUrl.slice(7)}`;
    }

    return imageUrl;
  } catch {
    return null;
  }
}

export async function fetchSOLBalance(connection: Connection, publicKey: PublicKey): Promise<number> {
  try {
    const solBalance = await connection.getBalance(publicKey);
    return solBalance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    throw error;
  }
}

export async function fetchTokens(connection: Connection, publicKey: PublicKey): Promise<Token[]> {
  try {
    // Fetch token accounts from both standard and 2022 SPL Token programs
    const [standardTokens, token2022Tokens] = await Promise.all([
      connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      }),
      connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_2022_PROGRAM_ID,
      }),
    ]);

    // Combine token accounts from both programs
    const allTokenAccounts = [
      ...standardTokens.value,
      ...token2022Tokens.value,
    ];

    const tokenData = await Promise.all(
      allTokenAccounts.map(async (account) => {
        const parsedInfo = account.account.data.parsed.info;
        const mintAddress = new PublicKey(parsedInfo.mint);
        const tokenAmount = parsedInfo.tokenAmount;

        let metadata, imageUrl;
        try {
          metadata = await getTokenMetadata(connection, mintAddress);
          imageUrl = metadata?.uri
            ? await fetchTokenMetadataFromUri(metadata.uri)
            : null;
        } catch {
          metadata = null;
          imageUrl = null;
        }

        return {
          pubkey: account.pubkey.toString(),
          mint: mintAddress,
          amount: tokenAmount.amount,
          decimals: tokenAmount.decimals,
          logo: imageUrl || undefined,
          name: metadata?.name || "Unknown Token",
          symbol: metadata?.symbol || "Unk",
        };
      })
    );

    // Filter out accounts with zero balance and null entries
    return tokenData.filter(
      (token) => token !== null && BigInt(token.amount) > BigInt(0)
    );
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw error;
  }
}

import * as Client from '@web3-storage/w3up-client'
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory'
import * as Proof from '@web3-storage/w3up-client/proof'
import { Signer } from '@web3-storage/w3up-client/principal/ed25519'

export async function uploadMetadata(
  tokenName: string,
  tokenSymbol: string,
  tokenDescription: string,
  imageUrl: string,
  network: string,
  decimals: number
) {
  // Load client with specific private key
  const principal = Signer.parse(process.env.NEXT_PUBLIC_W3_KEY!)
  const store = new StoreMemory()
  const client = await Client.create({ principal, store })
  // Add proof that this agent has been delegated capabilities on the space
  const proof = await Proof.parse(process.env.NEXT_PUBLIC_W3_PROOF!)
  const space = await client.addSpace(proof)
  await client.setCurrentSpace(space.did())

  const metadata = {
    name: tokenName,
    symbol: tokenSymbol,
    description: tokenDescription || `${tokenName} Token`,
    image: imageUrl,
    attributes: [
      {
        trait_type: "Network",
        value: network,
      },
      {
        trait_type: "Decimals",
        value: decimals.toString(),
      },
    ],
    properties: {
      category: "token",
      tokenDetails: {
        network: network,
        mintedOn: new Date().toISOString(),
        tokenStandard: "Token2022",
      },
    },
  };

  try {
    // Create metadata file
    const blob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json'
    })

    const file = new File([blob], 'metadata.json');
    // Upload file
    const cid = await client.uploadFile(file);

    const metadataUrl = `https://${cid}.ipfs.w3s.link`;
    return metadataUrl;
  } catch (error) {
    console.error("Error in uploadMetadata:", error);
    throw new Error(`Failed to upload metadata: ${error}`);
  }
}
