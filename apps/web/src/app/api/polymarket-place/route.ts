import { NextRequest, NextResponse } from 'next/server';
import { ClobClient, Side, OrderType } from '@polymarket/clob-client';
import { Wallet } from 'ethers';

async function placeOrder(orderData: any, config: any = {}) {
    // Build configuration
    const cfg = {
        baseUrl: config.baseUrl || 'https://clob.polymarket.com',
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

    // Determine side
    const side = String(orderData.side).toUpperCase() === 'BUY' ? Side.BUY : Side.SELL;

    // Create order
    const order = await clobClient.createOrder({
        tokenID: orderData.tokenID,
        price: parseFloat(orderData.price),
        side,
        size: orderData.size,
    });

    // Post order
    const orderType = orderData.orderType || OrderType.GTC;
    const response = await clobClient.postOrder(order, orderType);

    return {
        success: true,
        orderId: response.orderID || response.id,
        status: response.status,
        ...response,
    };
}

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const orderData = await request.json();

        // Validate required fields
        if (!orderData.tokenID || !orderData.price || !orderData.side || !orderData.size) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields',
                    message: 'tokenID, price, side, and size are required'
                },
                { status: 400 }
            );
        }

        // Place the order
        const result = await placeOrder(orderData);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error placing Polymarket order:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to place order',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
