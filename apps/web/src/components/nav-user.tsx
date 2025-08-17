'use client';

import * as React from 'react';
import { useSignOut, type User } from '@coinbase/cdp-hooks';
import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from '@tabler/icons-react';
import { useEnsAvatar, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { AccountDialog } from '@/components/account-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavUser({ user }: { user: User }) {
  const { signOut } = useSignOut();
  const { isMobile } = useSidebar();
  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false);

  const { data: name } = useEnsName({
    address: user.evmAccounts?.[0],
    chainId: mainnet.id,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: name ?? '',
    chainId: mainnet.id,
  });

  console.log('ensName', name);
  console.log('ensAvatar', ensAvatar);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={ensAvatar ?? ''} alt={ensAvatar ?? ''} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.authenticationMethods.email?.email}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.evmAccounts?.[0]}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AccountDialog 
          open={accountDialogOpen} 
          onOpenChange={setAccountDialogOpen} 
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
