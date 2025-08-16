'use client';

import * as React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import { Agent } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartTooltip } from '@/components/ui/chart';

interface CalibrationChartProps {
  agent: Agent;
}

export function CalibrationChart({ agent }: CalibrationChartProps) {
  const calibrationData = agent.calibration.map((point) => ({
    predicted: point.predicted * 100,
    actual: point.actual * 100,
    bin: point.bin * 100,
  }));

  const brier = agent.brier;
  const isWellCalibrated = brier < 0.15;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Calibration Reliability - {agent.name}
          <span
            className={`text-sm px-2 py-1 rounded ${isWellCalibrated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
          >
            Brier: {brier.toFixed(3)}
          </span>
        </CardTitle>
        <CardDescription>
          Predicted vs actual outcomes. Perfect calibration follows the diagonal
          line.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={calibrationData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="predicted"
                label={{
                  value: 'Predicted Probability (%)',
                  position: 'insideBottom',
                  offset: -10,
                }}
                domain={[0, 100]}
              />
              <YAxis
                label={{
                  value: 'Actual Rate (%)',
                  angle: -90,
                  position: 'insideLeft',
                }}
                domain={[0, 100]}
              />
              <ReferenceLine
                x={0}
                y={100}
                stroke="#888"
                strokeDasharray="2 2"
                label="Perfect Calibration"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (
                    active &&
                    payload &&
                    payload.length &&
                    payload[0]?.payload
                  ) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">
                          Confidence: {data.predicted?.toFixed(1) || '0.0'}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Actual: {data.actual?.toFixed(1) || '0.0'}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Difference:{' '}
                          {data.actual && data.predicted
                            ? (data.actual - data.predicted).toFixed(1)
                            : '0.0'}
                          %
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Calibration Quality</p>
            <p
              className={`font-medium ${isWellCalibrated ? 'text-green-600' : 'text-yellow-600'}`}
            >
              {isWellCalibrated ? 'Well Calibrated' : 'Needs Improvement'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Overconfidence</p>
            <p className="font-medium">
              {agent.calibration.some((p) => p.predicted > p.actual + 0.05)
                ? 'Detected'
                : 'None'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Sample Size</p>
            <p className="font-medium">
              {agent.calibration.length * 20} forecasts
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
