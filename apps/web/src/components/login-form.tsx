import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignInWithEmail, useVerifyEmailOTP } from '@coinbase/cdp-hooks';
import { GalleryVerticalEnd } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flowId, setFlowId] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const { flowId } = await signInWithEmail({ email });
      setFlowId(flowId);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flowId || !otp) return;

    setLoading(true);
    setError(null);

    try {
      const { user, isNewUser } = await verifyEmailOTP({
        flowId,
        otp,
      });

      console.log('Signed in user:', user);
      console.log('User EVM address:', user.evmAccounts?.[0]);
      console.log('Is new user:', isNewUser);

      router.push('/');
    } catch (error) {
      console.error('Sign in failed:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setFlowId(null);
    setOtp('');
    setError(null);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <span className="sr-only">Bridgewager Associates</span>
        </a>
        <h1 className="text-xl font-bold">Bridgewager Associates</h1>
      </div>

      {!flowId ? (
        <form onSubmit={handleEmailSubmit}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOTPSubmit}>
          <div className="flex flex-col gap-6">
            <div className="text-center text-sm text-gray-600">
              We&apos;ve sent a verification code to {email}
            </div>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBackToEmail}
                disabled={loading}
              >
                Back to Email
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
