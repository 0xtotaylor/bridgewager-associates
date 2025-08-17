import { NextRequest, NextResponse } from 'next/server';
import { ClobClient } from '@polymarket/clob-client';
import { Wallet } from 'ethers';

async function getOrderWithMarketInfo(orderId: string, config: any = {}) {
    // Build configuration
    const cfg = {
        baseUrl: config.baseUrl || 'https://clob.polymarket.com',
        gammaApiUrl: config.gammaApiUrl || 'https://gamma-api.polymarket.com',
        chainId: config.chainId || 137,
        privateKey: config.privateKey || process.env.POLYMARKET_PRIVATE_KEY,
        funderAddress: config.funderAddress || process.env.POLYMARKET_FUNDER_ADDRESS || '',
    };

    // Create signer and initial client
    const signer = new Wallet(cfg.privateKey);
    const tempClient = new ClobClient(cfg.baseUrl, cfg.chainId, signer);
    const apiCreds = await tempClient.createOrDeriveApiKey();

    // Create authenticated client
    const clobClient = new ClobClient(
        cfg.baseUrl,
        cfg.chainId,
        signer,
        apiCreds,
        2, // SignatureType.POLY_GNOSIS_SAFE = 2
        cfg.funderAddress
    );

    // Get the order details
    const orderData = await clobClient.getOrder(orderId);

    if (!orderData) {
        throw new Error(`No order found with ID: ${orderId}`);
    }

    // Get additional market information if market field exists
    let marketInfo = null;
    if (orderData.market) {
        try {
            // Use Gamma API with condition_ids parameter (this is what worked in testing)
            const marketUrl = `${cfg.gammaApiUrl}/markets?condition_ids=${orderData.market}`;
            const response = await fetch(marketUrl);

            if (response.ok) {
                const markets = await response.json();
                // The response is an array, get the first market if it exists
                if (markets && markets.length > 0) {
                    marketInfo = markets[0];
                }
            }
        } catch (error) {
            console.warn(`Error fetching market info for ${orderData.market}:`, error);
        }
    }

    return {
        success: true,
        order: {
            ...orderData,
            marketInfo: marketInfo
        }
    };
}

export async function GET(request: NextRequest) {
    try {
        // Get orderId from URL search params
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        // Validate required parameter
        if (!orderId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required parameter',
                    message: 'orderId is required as a query parameter'
                },
                { status: 400 }
            );
        }

        // Get the order with market info
        const result = await getOrderWithMarketInfo(orderId);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching Polymarket order:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch order',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
