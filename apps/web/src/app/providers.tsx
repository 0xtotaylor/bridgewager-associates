'use client';

import { CDPReactProvider } from '@coinbase/cdp-react';

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
      {children}
    </CDPReactProvider>
  );
}
