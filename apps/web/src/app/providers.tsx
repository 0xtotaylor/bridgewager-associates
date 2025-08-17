'use client';

import { Config } from '@coinbase/cdp-core';
import { CDPHooksProvider } from '@coinbase/cdp-hooks';
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const cdpConfig: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? '',
};

const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig,
  providerConfig: {
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  },
});

const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <CDPHooksProvider config={cdpConfig}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </CDPHooksProvider>
  );
}
