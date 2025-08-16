'use client';

import { CDPReactProvider } from '@coinbase/cdp-react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'wagmi/chains';

const CDP_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? '',
};

const APP_CONFIG = {
  name: 'Bridgewager Associates',
  logoUrl: 'http://localhost:3000/logo.svg',
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG}>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID}
        chain={base}
      >
        {children}
      </OnchainKitProvider>
    </CDPReactProvider>
  );
}
