import { generateJwt } from '@coinbase/cdp-sdk/auth';

import { SessionTokenRequest, SessionTokenResponse } from '@/lib/types';

export async function generateJWT(
  keyName: string,
  keySecret: string,
): Promise<string> {
  const requestMethod = 'POST';
  const requestHost = 'api.developer.coinbase.com';
  const requestPath = '/onramp/v1/token';

  try {
    const token = await generateJwt({
      apiKeyId: keyName,
      apiKeySecret: keySecret,
      requestMethod: requestMethod,
      requestHost: requestHost,
      requestPath: requestPath,
      expiresIn: 120,
    });

    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw error;
  }
}

export async function generateSessionToken(
  params: SessionTokenRequest,
): Promise<string | null> {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Session token generation failed:', error);
      throw new Error(error.error || 'Failed to generate session token');
    }

    const data: SessionTokenResponse = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error generating session token:', error);
    return null;
  }
}

export function formatAddressesForToken(
  address: string,
  networks: string[],
): Array<{ address: string; blockchains: string[] }> {
  return [
    {
      address,
      blockchains: networks,
    },
  ];
}
