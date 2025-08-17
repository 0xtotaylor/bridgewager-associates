import { NextResponse } from 'next/server';
import { Tusky } from '@tusky-io/ts-sdk';

export const dynamic = 'force-dynamic';

const tusky = new Tusky({ apiKey: process.env.TUSKY_API_KEY });

export async function GET() {
  const files = await tusky.file.listAll({
    vaultId: process.env.TUSKY_VAULT_ID,
  });

  const fileBuffers = await Promise.all(
    files.map(async (file) => {
      const buffer = await tusky.file.arrayBuffer(file.id);
      return {
        id: file.id,
        name: file.name,
        buffer: Array.from(new Uint8Array(buffer)),
      };
    }),
  );

  return NextResponse.json({ files: fileBuffers });
}
