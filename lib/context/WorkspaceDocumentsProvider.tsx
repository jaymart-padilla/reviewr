// https://supabase.com/docs/guides/realtime/subscribing-to-database-changes

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/database.types';

const WorkspaceDocumentsContext = createContext<Tables<'documents'>[] | null>(null);

/* !! CAUTION: Should this function got drop, make sure to also drop index in db | documents_id_user_id_workspace_id_key - and alter the public.documents replica identity to default

-- Reset replica identity back to default (uses the table's primary key)
alter table public.documents replica identity default;

-- Drop the unique index
drop index if exists public.documents_id_user_id_workspace_id_key;
*/
export function WorkspaceDocumentsProvider({
  workspaceId,
  initialDocuments,
  children,
}: {
  workspaceId: string;
  initialDocuments: Tables<'documents'>[];
  children: React.ReactNode;
}) {
  const [documents, setDocuments] = useState(initialDocuments);

  useEffect(() => {
    const supabase = createClient();
    const upsertDoc = (newDoc: Tables<'documents'>) => {
      setDocuments((prev) => {
        const exists = prev.some((d) => d.id === newDoc.id);
        return exists
          ? prev.map((d) => (d.id === newDoc.id ? { ...d, ...newDoc } : d))
          : [...prev, newDoc];
      });
    };

    const channel = supabase
      .channel(`workspace-documents-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (p) => upsertDoc(p.new as Tables<'documents'>)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (p) => upsertDoc(p.new as Tables<'documents'>)
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'documents',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (p) => {
          setDocuments((prev) =>
            prev.filter((doc) => doc.id !== (p.old as Tables<'documents'>).id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  return (
    <WorkspaceDocumentsContext.Provider value={documents}>
      {children}
    </WorkspaceDocumentsContext.Provider>
  );
}

export function useWorkspaceDocuments() {
  const ctx = useContext(WorkspaceDocumentsContext);
  if (ctx === null)
    throw new Error('useWorkspaceDocuments must be used within WorkspaceDocumentsProvider');
  return ctx;
}
