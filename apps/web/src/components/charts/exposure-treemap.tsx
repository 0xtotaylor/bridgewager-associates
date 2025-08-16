'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMarkets, mockAgents } from '@/lib/mock-data';

interface TreemapData {
  topic: string;
  agent: string;
  value: number;
  markets: number;
  color: string;
}

export function ExposureTreemap() {
  const exposureData: TreemapData[] = React.useMemo(() => {
    const topicAgentMap = new Map<string, Map<string, { value: number; markets: number }>>();
    
    // Aggregate exposure by topic and agent
    mockMarkets.forEach(market => {
      if (!topicAgentMap.has(market.topic)) {
        topicAgentMap.set(market.topic, new Map());
      }
      
      // Simulate agent allocation based on their specialties
      mockAgents.forEach(agent => {
        const agentMap = topicAgentMap.get(market.topic)!;
        const key = agent.name || 'Unknown';
        
        // Simulate exposure based on agent specialty and market
        let exposure = 0;
        if (market.topic === 'Politics' && key.includes('Politics')) exposure = market.sizeSuggested * 0.4;
        else if (market.topic === 'Sports' && key.includes('Sports')) exposure = market.sizeSuggested * 0.4;
        else if (market.topic === 'Crypto' && key.includes('Crypto')) exposure = market.sizeSuggested * 0.4;
        else if (key.includes('Research')) exposure = market.sizeSuggested * 0.2;
        else exposure = market.sizeSuggested * 0.1;
        
        if (!agentMap.has(key)) {
          agentMap.set(key, { value: 0, markets: 0 });
        }
        
        const current = agentMap.get(key)!;
        current.value += exposure;
        current.markets += 1;
      });
    });
    
    const result: TreemapData[] = [];
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
    let colorIndex = 0;
    
    topicAgentMap.forEach((agentMap, topic) => {
      agentMap.forEach((data, agent) => {
        if (data.value > 1000) { // Only show significant exposures
          const parts = agent.split('-');
          const shortAgent = parts.length > 1 ? (parts[0] ?? 'Unknown') : agent;
          result.push({
            topic,
            agent: shortAgent, // Shorten agent names
            value: data.value,
            markets: data.markets,
            color: colors[colorIndex % colors.length] ?? 'bg-gray-500'
          });
        }
      });
      colorIndex++;
    });
    
    return result.sort((a, b) => b.value - a.value);
  }, []);

  const totalExposure = exposureData.reduce((sum, item) => sum + item.value, 0);
  const maxExposure = Math.max(...exposureData.map(item => item.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capital Allocation Treemap</CardTitle>
        <CardDescription>
          Capital allocated by topic and agent. Size represents exposure amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
            {exposureData.map((item, index) => {
              const size = (item.value / maxExposure) * 100 + 20; // Minimum 20% size
              const opacity = (item.value / maxExposure) * 0.6 + 0.4; // Minimum 40% opacity
              
              return (
                <div
                  key={`${item.topic}-${item.agent}-${index}`}
                  className={`${item.color} rounded-lg p-3 text-white relative overflow-hidden`}
                  style={{ 
                    minHeight: `${size}px`,
                    opacity: opacity
                  }}
                >
                  <div className="text-xs font-semibold truncate">{item.topic}</div>
                  <div className="text-xs opacity-90 truncate">{item.agent}</div>
                  <div className="text-xs font-mono mt-1">
                    ${(item.value / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs opacity-75">
                    {item.markets} markets
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t text-sm">
            <div>
              <p className="text-muted-foreground">Total Exposure</p>
              <p className="font-semibold">${(totalExposure / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-muted-foreground">Largest Position</p>
              <p className="font-semibold">{exposureData[0]?.topic || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Diversification</p>
              <p className="font-semibold">{exposureData.length} positions</p>
            </div>
            <div>
              <p className="text-muted-foreground">Concentration Risk</p>
              <p className="font-semibold">
                {totalExposure > 0 ? ((exposureData[0]?.value || 0) / totalExposure * 100).toFixed(0) : 0}%
              </p>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Larger rectangles indicate higher capital allocation. Color intensity represents relative exposure within each topic.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}