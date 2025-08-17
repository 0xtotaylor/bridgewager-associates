'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEvmAddress } from '@coinbase/cdp-hooks';
import { IconCurrencyDollar, type Icon } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { PolymarketTransactionDialog } from '@/components/polymarket-transaction-dialog';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  const { evmAddress } = useEvmAddress();
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!evmAddress) return;

    const addresses = [
      {
        address: evmAddress,
        blockchains: ['base'],
      },
    ];

    const generateURL = async () => {
      try {
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addresses,
            assets: ['USDC'],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const onramp_url = `https://pay.coinbase.com/buy/select-asset?sessionToken=${data.token}&defaultNetwork=base&presetFiatAmount=5`;
        setOnrampUrl(onramp_url);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    generateURL();
  }, [evmAddress]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <PolymarketTransactionDialog>
              <SidebarMenuButton
                tooltip="Dashboard"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <Image
                  src="/polymarket.svg"
                  alt="Polymarket"
                  width={12}
                  height={12}
                />
                <span>Capital Contribution</span>
              </SidebarMenuButton>
            </PolymarketTransactionDialog>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              asChild
            >
              <a href={onrampUrl!} target="_blank" rel="noopener noreferrer">
                <IconCurrencyDollar />
                <span className="sr-only">Dollar</span>
              </a>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
