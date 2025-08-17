import { NextRequest, NextResponse } from 'next/server';

import { generateJWT } from '@/lib/session';
import { SessionTokenRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const keyName = process.env.CDP_API_KEY_NAME;
    const keySecret = process.env.CDP_API_KEY_PRIVATE_KEY;

    if (!keyName || !keySecret) {
      return NextResponse.json(
        {
          error:
            'Missing CDP API credentials. Please set CDP_API_KEY and CDP_API_SECRET environment variables.',
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { addresses, assets } = body as SessionTokenRequest;

    if (!addresses || addresses.length === 0) {
      return NextResponse.json(
        {
          error: 'Addresses parameter is required',
        },
        { status: 400 },
      );
    }

    let jwtToken: string;
    try {
      jwtToken = await generateJWT(keyName, keySecret);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('secretOrPrivateKey')
      ) {
        return NextResponse.json(
          {
            error: 'Invalid private key format',
            details:
              "The CDP_API_SECRET should be your EC private key. If you have just the base64 content, ensure it's properly formatted.",
            hint: 'Your private key should either be in PEM format with BEGIN/END headers, or just the base64 content that will be wrapped automatically.',
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to authenticate with CDP API',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 },
      );
    }

    const cdpApiUrl = 'https://api.developer.coinbase.com/onramp/v1/token';

    const requestBody = {
      addresses,
      ...(assets && { assets }),
    };

    const response = await fetch(cdpApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = responseText;
      }

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            details:
              'Please verify your CDP API key and secret are correct. The API key should be in the format: organizations/{org_id}/apiKeys/{key_id}',
            apiError: errorDetails,
          },
          { status: 401 },
        );
      }

      return NextResponse.json(
        {
          error: `CDP API error: ${response.status} ${response.statusText}`,
          details: errorDetails,
        },
        { status: response.status },
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse response:', error);
      return NextResponse.json(
        {
          error: 'Invalid response from CDP API',
          details: responseText,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token: data.token,
      channel_id: data.channelId || data.channel_id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate session token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
