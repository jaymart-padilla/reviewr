import { FileText, Presentation, FileType2 } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Tables } from '@/database.types';

type DocumentType = Tables<'documents'>['file_type'];

const DESCRIPTION_LIMIT = 500;
const README_LIMIT = 500;

const ACCEPTED_DOCUMENT_TYPES: {
  type: DocumentType;
  label: string;
  mime: string;
  extensions: string[];
}[] = [
  { type: 'pdf', label: 'PDF', mime: 'application/pdf', extensions: ['.pdf'] },
  {
    type: 'docx',
    label: 'DOCX',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
  },
  {
    type: 'pptx',
    label: 'PPTX',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['.pptx'],
  },
  { type: 'txt', label: 'TXT', mime: 'text/plain', extensions: ['.txt'] },
];

const FORMAT_ICONS: Record<DocumentType, ComponentType<{ className?: string }>> = {
  pdf: FileText,
  docx: FileText,
  pptx: Presentation,
  txt: FileType2,
};

const WORKSPACE_DOCUMENTS_BUCKET = 'workspace_documents';

const MAX_TOTAL_UPLOAD_BYTES = 40 * 1024 * 1024;

export {
  type DocumentType,
  ACCEPTED_DOCUMENT_TYPES,
  FORMAT_ICONS,
  WORKSPACE_DOCUMENTS_BUCKET,
  MAX_TOTAL_UPLOAD_BYTES,
  DESCRIPTION_LIMIT,
  README_LIMIT,
};
