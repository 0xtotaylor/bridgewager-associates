'use client';

import { useState } from 'react';
import { useEvmAddress, useSendEvmTransaction } from '@coinbase/cdp-hooks';
import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PolymarketTransactionDialogProps {
  children: React.ReactNode;
}

const MIN_AMOUNT = 3.0;

export function PolymarketTransactionDialog({
  children,
}: PolymarketTransactionDialogProps) {
  const [amount, setAmount] = useState('3.00');
  const [isOpen, setIsOpen] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);
  const { sendEvmTransaction } = useSendEvmTransaction();
  const { evmAddress } = useEvmAddress();

  const handleSend = async () => {
    if (!evmAddress || !amount) return;

    setIsTransacting(true);
    try {
      const ethAmount = parseFloat(amount);
      const weiAmount = BigInt(Math.floor(ethAmount * 1e18));

      await sendEvmTransaction({
        transaction: {
          to: evmAddress,
          value: weiAmount,
          gas: 21000n,
          chainId: 8453,
          type: 'eip1559',
        },
        evmAccount: evmAddress,
        network: 'base',
      });

      setAmount('3.00');
      setIsOpen(false);
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsTransacting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const isValidAmount = amount && parseFloat(amount) >= MIN_AMOUNT;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Capital Contribution</DialogTitle>
          <DialogDescription>
            Specify the amount you want to invest in USDC. <br />
            The minimum amount is <b>3.00 USDC</b>.<br />
            The transaction will be sent on Base.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 relative">
              <Input
                id="amount"
                type="text"
                placeholder="3.00"
                value={amount}
                onChange={handleAmountChange}
                className="pr-12"
                disabled={isTransacting}
                min={MIN_AMOUNT}
                inputMode="decimal"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                USDC
              </span>
            </div>
          </div>
          {evmAddress && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">
                To
              </Label>
              <div className="col-span-3">
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                  {evmAddress}
                </code>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isTransacting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!isValidAmount || !evmAddress || isTransacting}
          >
            {isTransacting ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Contributing...
              </>
            ) : (
              'Contribute'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
