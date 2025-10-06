// app/api/convert/route.ts
import { runConversionAgent } from '@/agents/uom-converter/uomConverterAgent';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    const output = await runConversionAgent(input);
    return NextResponse.json({ ok: true, output });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
