'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RISK_PROFILES = [
  { value: 'conservative', label: 'Conservative - Low risk, stable returns' },
  { value: 'moderate', label: 'Moderate - Balanced risk and return' },
  { value: 'aggressive', label: 'Aggressive - High risk, high potential return' },
  { value: 'speculative', label: 'Speculative - Very high risk, maximum upside' },
];

const MARKET_TYPES = [
  { id: 'politics', label: 'Political Elections' },
  { id: 'sports', label: 'Sports Events' },
  { id: 'economics', label: 'Economic Indicators' },
  { id: 'weather', label: 'Weather & Climate' },
  { id: 'technology', label: 'Technology & Innovation' },
  { id: 'entertainment', label: 'Entertainment & Awards' },
  { id: 'crypto', label: 'Cryptocurrency' },
  { id: 'stocks', label: 'Stock Market' },
];

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const [riskProfile, setRiskProfile] = React.useState<string>('');
  const [selectedMarkets, setSelectedMarkets] = React.useState<string[]>([]);

  const handleMarketToggle = (marketId: string) => {
    setSelectedMarkets(prev =>
      prev.includes(marketId)
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  };

  const handleSave = () => {
    console.log('Saving preferences:', {
      riskProfile,
      selectedMarkets,
    });
    
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Account Preferences</DialogTitle>
          <DialogDescription>
            Configure your risk profile and market preferences to personalize your trading experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="risk-profile">Risk Profile</Label>
            <Select value={riskProfile} onValueChange={setRiskProfile}>
              <SelectTrigger id="risk-profile" className="w-full">
                <SelectValue placeholder="Select your risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                {RISK_PROFILES.map((profile) => (
                  <SelectItem key={profile.value} value={profile.value}>
                    {profile.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Market Types</Label>
            <div className="space-y-2">
              {MARKET_TYPES.map((market) => (
                <div key={market.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={market.id}
                    checked={selectedMarkets.includes(market.id)}
                    onCheckedChange={() => handleMarketToggle(market.id)}
                  />
                  <Label htmlFor={market.id} className="text-sm font-normal">
                    {market.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}