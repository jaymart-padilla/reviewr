import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { WorkspaceWithDocumentCount } from '@/app/(protected)/workspaces/types';

const getWorkspaces = cache(
  async (userId: string, limit?: number): Promise<WorkspaceWithDocumentCount[]> => {
    const supabase = await createClient();

    let query = supabase
      .from('workspaces')
      .select('*, documents(count)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const { data: workspaces, error } = await query;

    if (error || !workspaces) return [];

    return workspaces.map((workspace) => {
      const { documents, ...rest } = workspace as typeof workspace & {
        documents: { count: number }[]; // type of the embedded documents relationship with count
      };
      return { ...rest, document_count: documents?.[0]?.count ?? 0 };
    });
  }
);

export { getWorkspaces };
