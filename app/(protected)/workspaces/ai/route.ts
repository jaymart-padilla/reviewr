import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/app/(protected)/workspaces/ai/lib/process-document';

// Give this route more time than the default (Vercel Hobby caps functions
// at 10s by default) — raise as needed (refer: real processing times)
export const maxDuration = 60;

// Internal-only "job runner" endpoint. It's triggered right after a
// `documents` row is inserted with status "processing"
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret');
  if (secret !== process.env.INTERNAL_JOB_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentId } = await req.json();
  if (!documentId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });
  }

  try {
    await processDocument(documentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    // processDocument already wrote status: 'failed' + error_message to the
    // row itself, so the client polling `documents.status` sees the failure —
    // this response is just for logging/debugging the job runner itself.
    console.error(`Failed to process document ${documentId}:`, error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
