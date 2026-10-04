import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { ExtractedPage } from '@/app/(protected)/workspaces/types';

export async function extractPdf(buffer: Buffer): Promise<ExtractedPage[]> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    // eliminate error: "Warning: UnknownErrorException: Ensure that the standardFontDataUrl API parameter is provided."
    // since we're only extracting text and not rendering, just fallback to system font
    useSystemFonts: true,
    disableFontFace: true,
  });
  const doc = await loadingTask.promise;

  const pages: ExtractedPage[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();

    // clean up text
    const text = content.items
      .map((item) => ('str' in item ? item.str : '')) // get the text from each PDF.js item
      .join(' ')
      .replace(/\s+/g, ' ') // replace multiple whitespace characters with one space
      .trim();

    pages.push({ pageNumber: pageNum, text });
  }

  return pages;
}
