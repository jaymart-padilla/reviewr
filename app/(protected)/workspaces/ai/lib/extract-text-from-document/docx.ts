import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import type { ExtractedPage } from '@/app/(protected)/workspaces/types';

// added styles for "title" and "subtitle"
const STYLE_MAP = [
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='Heading 4'] => h4:fresh",
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
];

export async function extractDocx(buffer: Buffer): Promise<ExtractedPage[]> {
  const { value: html } = await mammoth.convertToHtml({ buffer }, { styleMap: STYLE_MAP });

  // Headings are converted to Markdown markers so they act as stronger split boundaries.
  const text = htmlToMarkdownHeadings(html);

  // DOCX files contain no information about pagination — treat document as one page
  // refer: www.toptal.com/developers/xml/an-informal-introduction-to-docx#:~:text=DOCX%20files%20contain%20no%20information%20about%20pagination.
  return [{ pageNumber: null, text }];
}

function htmlToMarkdownHeadings(html: string): string {
  const $ = cheerio.load(html);
  const lines: string[] = [];

  $('body')
    .children()
    .each((_, el) => {
      const $el = $(el);
      const tag = el.tagName?.toLowerCase();
      const headingLevel = tag?.match(/^h([1-6])$/)?.[1];

      // prefix header elements with markdown style "#" markers
      if (headingLevel) {
        const level = Number(headingLevel);
        const headingText = $el.text().trim();
        if (headingText) {
          lines.push(`${'#'.repeat(level)} ${headingText}`);
        }
        return;
      }

      const blockText = $el.text().trim();
      if (blockText) {
        lines.push(blockText);
      }
    });

  return lines.join('\n\n');
}
