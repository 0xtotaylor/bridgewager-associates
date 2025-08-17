'use client';

import * as React from 'react';
import { AgentSpecificTable } from '@/components/agent-specific-tables';

export default function Agent({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const [agent, setAgent] = React.useState<string>('');

  React.useEffect(() => {
    params.then(({ agent }) => {
      setAgent(agent);
    });
  }, [params]);

  return <AgentSpecificTable agent={agent} />;
}