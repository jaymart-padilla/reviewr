import { extractDocx } from '@/app/(protected)/workspaces/ai/lib/extract-text-from-document/docx';
import { extractPdf } from '@/app/(protected)/workspaces/ai/lib/extract-text-from-document/pdf';
import { extractPptx } from '@/app/(protected)/workspaces/ai/lib/extract-text-from-document/pptx';
import { extractTxt } from '@/app/(protected)/workspaces/ai/lib/extract-text-from-document/txt';
import type { Tables } from '@/database.types';
import type { ExtractedPage } from '@/app/(protected)/workspaces/types';

export async function extractText(
  fileType: Tables<'documents'>['file_type'],
  buffer: Buffer
): Promise<ExtractedPage[]> {
  switch (fileType) {
    case 'pdf':
      return extractPdf(buffer);
    case 'docx':
      return extractDocx(buffer);
    case 'pptx':
      return extractPptx(buffer);
    case 'txt':
      return extractTxt(buffer);
    default: {
      const _exhaustive: never = fileType;
      throw new Error(`Unsupported file type: ${_exhaustive}`);
    }
  }
}
