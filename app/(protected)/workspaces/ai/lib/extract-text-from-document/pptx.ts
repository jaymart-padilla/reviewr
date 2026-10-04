// .pptx is just a zip archive of XML files, one per slide, at
// ppt/slides/slide1.xml, slide2.xml, etc. Each slide's text runs live in
// <a:t>...</a:t> tags. No heavy pptx-parsing library needed for plain text.
import JSZip from 'jszip';
import type { ExtractedPage } from '@/app/(protected)/workspaces/types';

export async function extractPptx(buffer: Buffer): Promise<ExtractedPage[]> {
  const zip = await JSZip.loadAsync(buffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => slideNumber(a) - slideNumber(b));

  const pages: ExtractedPage[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.files[slideFiles[i]].async('text');
    const textRuns = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/g)].map((m) => decodeXmlEntities(m[1])); // find all matched texts inside <a:t> xml tags and extracts the enclosed text for formatting

    // "page" number here = slide number, used for citations like
    // "Source: My Deck.pptx — Slide 4"
    pages.push({ pageNumber: i + 1, text: textRuns.join(' ').trim() });
  }

  return pages;
}

function slideNumber(filename: string): number {
  return Number(filename.match(/slide(\d+)\.xml/)?.[1] ?? 0); // capture slide number
}

// process extracted text from every <a:t>...</a:t> tag, then decode/convert found special entities
function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
