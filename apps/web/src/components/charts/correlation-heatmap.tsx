'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockAgents } from '@/lib/mock-data';

export function CorrelationHeatmap() {
  const agents = mockAgents;
  
  const getCorrelationColor = (correlation: number) => {
    if (correlation === 1) return 'bg-blue-700 text-white';
    if (correlation > 0.5) return 'bg-red-500 text-white';
    if (correlation > 0.2) return 'bg-red-300 text-black';
    if (correlation > -0.2) return 'bg-gray-100 text-black';
    if (correlation > -0.5) return 'bg-blue-300 text-black';
    return 'bg-blue-500 text-white';
  };

  const getCorrelation = (agent1: string, agent2: string) => {
    if (agent1 === agent2) return 1;
    const agent = agents.find(a => a.id === agent1);
    return agent?.correlations[agent2] || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Correlation Matrix</CardTitle>
        <CardDescription>
          Forecast correlation between agents. High correlation increases portfolio risk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-1 text-xs">
            <div></div>
            {agents.map(agent => (
              <div key={agent.id} className="text-center font-medium p-2">
                {agent.name.split('-')[0]}
              </div>
            ))}
            
            {agents.map(rowAgent => (
              <React.Fragment key={rowAgent.id}>
                <div className="text-right font-medium p-2">
                  {rowAgent.name.split('-')[0]}
                </div>
                {agents.map(colAgent => {
                  const correlation = getCorrelation(rowAgent.id, colAgent.id);
                  return (
                    <div
                      key={`${rowAgent.id}-${colAgent.id}`}
                      className={`p-2 text-center font-mono text-sm rounded ${getCorrelationColor(correlation)}`}
                      title={`${rowAgent.name} vs ${colAgent.name}: ${correlation.toFixed(2)}`}
                    >
                      {correlation.toFixed(2)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Negative (-1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border rounded"></div>
              <span>No correlation (0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Positive (+1.0)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium">Highest Correlation</p>
              <p className="text-sm text-muted-foreground">Alpha-Research ↔ Beta-Politics: +0.23</p>
            </div>
            <div>
              <p className="text-sm font-medium">Portfolio Diversification</p>
              <p className="text-sm text-muted-foreground">Good - Low inter-agent correlation</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}