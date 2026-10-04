'use server';

import z from 'zod';
import { after } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'crypto';
import { DEFAULT_ERR_MESSAGE } from '@/lib/constants';
import { formatBytes } from '@/app/(protected)/workspaces/lib/helpers';
import {
  ACCEPTED_DOCUMENT_TYPES,
  WORKSPACE_DOCUMENTS_BUCKET,
  MAX_TOTAL_UPLOAD_BYTES,
  type DocumentType,
} from '@/app/(protected)/workspaces/constants';
import { paths } from '@/lib/paths';
import { getRequiredUser } from '@/lib/auth/get-user';
import { firstZodFlattenFieldErrors, getErrorMessage } from '@/lib/errors';
import { processDocument } from '@/app/(protected)/workspaces/ai/lib/process-document';
import type { BaseServerActionResponse } from '@/components/types';

const MIME_TO_FILE_TYPE: Record<string, DocumentType> = Object.fromEntries(
  ACCEPTED_DOCUMENT_TYPES.map((adt) => [adt.mime, adt.type] as const)
);

const workspaceDocumentSchema = z
  .file()
  .min(1, 'File is empty')
  .max(MAX_TOTAL_UPLOAD_BYTES, 'File is too large')
  .mime(
    ACCEPTED_DOCUMENT_TYPES.map((adt) => adt.mime),
    'Unsupported file type'
  );

const workspaceDocumentsFormSchema = z.object({
  documents: z
    .array(workspaceDocumentSchema)
    .min(1, 'Add at least one document')
    .refine((files) => files.reduce((sum, f) => sum + f.size, 0) <= MAX_TOTAL_UPLOAD_BYTES, {
      message: `Combined size of all documents must not exceed ${formatBytes(MAX_TOTAL_UPLOAD_BYTES)}`,
    }),
});

interface WorkspaceDocumentsFormState extends BaseServerActionResponse {
  fieldErrors?: Partial<Record<keyof z.infer<typeof workspaceDocumentsFormSchema>, string>>;
}

export async function saveWorkspaceDocumentAction(
  workspaceId: string | null,
  prevState: WorkspaceDocumentsFormState,
  formData: FormData
): Promise<WorkspaceDocumentsFormState> {
  if (!workspaceId) {
    return {
      success: false,
      error: 'Missing workspace.',
    };
  }
  const supabase = await createClient();

  const raw = {
    documents: formData.getAll('workspace-documents'),
  };

  const parsed = workspaceDocumentsFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: firstZodFlattenFieldErrors(parsed.error),
    };
  }

  const { documents } = parsed.data;

  try {
    for (const document of documents) {
      const documentId = randomUUID();
      const ext = document.name.split('.').pop()?.toLowerCase() ?? '';
      const path = `${workspaceId}/${documentId}${ext ? `.${ext}` : ''}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(WORKSPACE_DOCUMENTS_BUCKET)
        .upload(path, document, {
          contentType: document.type,
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('documents').insert({
        id: documentId,
        user_id: (await getRequiredUser()).id,
        workspace_id: workspaceId,
        file_name: document.name,
        file_size: document.size,
        file_type: MIME_TO_FILE_TYPE[document.type],
        storage_path: uploadData.path,
        status: 'processing',
      });

      if (insertError) throw insertError;

      // kick off processing here (fire-and-forget to an edge function/route,
      // or enqueue a job) — don't await heavy extraction/embedding inline

      // Runs after the response is sent — the user sees "upload successful"
      // immediately, and extraction/chunking/embedding happens in the background.
      after(() =>
        processDocument(documentId).catch((err) => {
          console.error(`Processing failed for document ${documentId}:`, err);
        })
      );
      // TODO: rather than running this through "after()", scale with job queue/worker | reason: after() depends on the server that this was requested to -- server stop/dies - process stop
    }

    revalidatePath('/workspaces', 'layout');
    return {
      success: true,
      error: null,
    };
  } catch (error: unknown) {
    console.error(`${paths.workspaces.text} Action Error: ${error}`);
    return {
      success: false,
      error: getErrorMessage(error, DEFAULT_ERR_MESSAGE),
    };
  }
}

export async function deleteWorkspaceDocumentAction(
  workspaceDocumentsId: string[] | null,
  prevState: BaseServerActionResponse
): Promise<BaseServerActionResponse> {
  if (!workspaceDocumentsId || workspaceDocumentsId.length === 0) {
    return {
      success: false,
      error: 'No workspace document selected for deletion.',
    };
  }

  const supabase = await createClient();
  const userId = (await getRequiredUser()).id;

  try {
    const { data: workspaceDocuments, error: selectError } = await supabase
      .from('documents')
      .select('*')
      .in('id', workspaceDocumentsId)
      .eq('user_id', userId);

    if (selectError) throw selectError;

    if (workspaceDocuments && workspaceDocuments.length > 0) {
      // delete in storage
      const toBeDeletedWorkspaceDocuments = workspaceDocuments.map((wd) => {
        return `${wd.workspace_id}/${wd.file_name}`;
      });
      const { error: storageDeleteError } = await supabase.storage
        .from(WORKSPACE_DOCUMENTS_BUCKET)
        .remove(toBeDeletedWorkspaceDocuments); // delete file(s) under the workspace_documents(storage bucket) > workspace_id folder/file_name
      if (storageDeleteError) throw storageDeleteError;

      // delete db record
      const { error: recordDeleteError } = await supabase
        .from('documents')
        .delete()
        .in('id', workspaceDocumentsId)
        .eq('user_id', userId);
      if (recordDeleteError) throw recordDeleteError;
    }

    revalidatePath('/workspaces', 'layout');
    return {
      success: true,
      error: null,
    };
  } catch (error: unknown) {
    console.error(`${paths.workspaces.text} Action Error: ${error}`);
    return {
      success: false,
      error: getErrorMessage(error, DEFAULT_ERR_MESSAGE),
    };
  }
}
