import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { paths } from '@/lib/paths';
import type { Tables } from '@/database.types';

async function getDocumentsByWorkspaceId(id: string): Promise<Tables<'documents'>[]> {
  const supabase = await createClient();

  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('workspace_id', id)
    .order('updated_at', { ascending: false });

  if (error) {
    redirect(paths.workspaces.url);
  }

  return documents;
}

export { getDocumentsByWorkspaceId };
