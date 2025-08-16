'use client';

import * as React from 'react';
import { useCurrentUser } from '@coinbase/cdp-hooks';
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconUsers,
} from '@tabler/icons-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: IconDashboard,
    },
    {
      title: 'Lifecycle',
      url: '#',
      icon: IconListDetails,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: IconChartBar,
    },
    {
      title: 'Projects',
      url: '#',
      icon: IconFolder,
    },
    {
      title: 'Team',
      url: '#',
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: IconCamera,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Proposal',
      icon: IconFileDescription,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
    {
      title: 'Prompts',
      icon: IconFileAi,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#',
        },
        {
          title: 'Archived',
          url: '#',
        },
      ],
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '#',
      icon: IconDatabase,
    },
    {
      name: 'Reports',
      url: '#',
      icon: IconReport,
    },
    {
      name: 'Word Assistant',
      url: '#',
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentUser } = useCurrentUser();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  Bridgewager Associates
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        {currentUser && <NavUser user={currentUser} />}
      </SidebarFooter>
    </Sidebar>
  );
}
