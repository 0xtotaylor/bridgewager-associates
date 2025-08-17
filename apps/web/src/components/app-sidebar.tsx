'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@coinbase/cdp-hooks';
import {
  IconAlertTriangle,
  IconChartPie,
  IconDatabase,
  IconListDetails,
  IconReport,
  IconShield,
  IconTrendingUp,
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
      title: 'Research Analyst',
      url: '/team/research-analyst',
      icon: IconListDetails,
      items: [
        {
          title: 'Calibration Charts',
          url: '#',
        },
        {
          title: 'Forecast Analysis',
          url: '#',
        },
        {
          title: 'Agent Performance',
          url: '#',
        },
      ],
    },
    {
      title: 'Portfolio Manager',
      url: '/team/portfolio-manager',
      icon: IconChartPie,
      items: [
        {
          title: 'Capital Allocation',
          url: '#',
        },
        {
          title: 'Risk Attribution',
          url: '#',
        },
        {
          title: 'Performance Analytics',
          url: '#',
        },
      ],
    },
    {
      title: 'Compliance Officer',
      url: '/team/compliance-officer',
      icon: IconShield,
      items: [
        {
          title: 'Risk Limits',
          url: '#',
        },
        {
          title: 'Exposure Monitoring',
          url: '#',
        },
        {
          title: 'Audit Logs',
          url: '#',
        },
      ],
    },
  ],
  documents: [
    {
      name: 'Financial News',
      url: 'https://www.ft.com',
      icon: IconDatabase,
    },
    {
      name: 'Global News',
      url: 'https://www.bbc.com/news',
      icon: IconReport,
    },
    {
      name: 'Breaking News',
      url: 'https://www.cnn.com',
      icon: IconAlertTriangle,
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
              <Link href="/">
                <span className="text-base font-semibold">
                  Bridgewager Associates
                </span>
              </Link>
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
