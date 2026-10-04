import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { paths } from '@/lib/paths';
import type { Tables } from '@/database.types';

const getWorkspaceById = cache(async (id: string): Promise<Tables<'workspaces'>> => {
  const supabase = await createClient();

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !workspace) {
    redirect(paths.workspaces.url);
  }

  return workspace;
});

export { getWorkspaceById };
