'use client';

import * as React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockFundMetrics } from '@/lib/mock-data';

export function StressCone() {
  const stressData = React.useMemo(() => {
    const baseNAV = mockFundMetrics.nav;
    const scenarios = [];
    
    for (let days = 0; days <= 30; days++) {
      // Simulate stress scenarios with increasing uncertainty over time
      const timeMultiplier = Math.sqrt(days / 30);
      const volatility = 0.15; // 15% annual volatility
      
      const worst = baseNAV * (1 - volatility * timeMultiplier * 2.5); // 99th percentile worst
      const p5 = baseNAV * (1 - volatility * timeMultiplier * 1.6);    // 95th percentile
      const median = baseNAV * (1 - volatility * timeMultiplier * 0.1); // Expected slight decline
      const p95 = baseNAV * (1 + volatility * timeMultiplier * 1.6);   // 95th percentile upside
      const best = baseNAV * (1 + volatility * timeMultiplier * 2.5);  // 99th percentile best
      
      scenarios.push({
        day: days,
        worst: worst,
        p5: p5,
        median: median,
        p95: p95,
        best: best,
        current: baseNAV, // Current NAV reference
      });
    }
    
    return scenarios;
  }, []);

  const formatCurrency = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Stress Test Cone</CardTitle>
        <CardDescription>
          Simulated portfolio value under various market stress scenarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stressData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                label={{ value: 'Days', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: 'Portfolio Value', angle: -90, position: 'insideLeft' }}
                tickFormatter={formatCurrency}
              />
              
              {/* Stress cone areas */}
              <Area
                dataKey="best"
                stroke="none"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.1}
              />
              <Area
                dataKey="p95"
                stroke="none"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.2}
              />
              <Area
                dataKey="median"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="hsl(var(--chart-1))"
                fillOpacity={0.1}
              />
              <Area
                dataKey="p5"
                stroke="none"
                fill="hsl(var(--chart-4))"
                fillOpacity={0.2}
              />
              <Area
                dataKey="worst"
                stroke="none"
                fill="hsl(var(--chart-4))"
                fillOpacity={0.1}
              />
              
              {/* Current NAV reference line */}
              <ReferenceLine 
                y={mockFundMetrics.nav} 
                stroke="#888" 
                strokeDasharray="2 2" 
                label="Current NAV"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div>
            <p className="text-muted-foreground">30-Day VaR (95%)</p>
            <p className="font-semibold text-red-600">
              {formatCurrency(stressData[30]?.p5 || 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected Value</p>
            <p className="font-semibold">
              {formatCurrency(stressData[30]?.median || 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Best Case (95%)</p>
            <p className="font-semibold text-green-600">
              {formatCurrency(stressData[30]?.p95 || 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Stress Scenario</p>
            <p className="font-semibold text-red-700">
              {formatCurrency(stressData[30]?.worst || 0)}
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p>
            Stress testing assumes correlated market movements affecting prediction market liquidity.
            Cone widens over time reflecting increased uncertainty in longer-term scenarios.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}