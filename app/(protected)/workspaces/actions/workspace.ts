'use server';

import z from 'zod';
import { firstZodFlattenFieldErrors, getErrorMessage } from '@/lib/errors';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_ERR_MESSAGE } from '@/lib/constants';
import { DESCRIPTION_LIMIT, README_LIMIT } from '@/app/(protected)/workspaces/constants';
import { paths } from '@/lib/paths';
import type { BaseServerActionResponse } from '@/components/types';

const workspaceFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(128),
  description: z.string().trim().max(DESCRIPTION_LIMIT),
  readmeContent: z.string().trim().max(README_LIMIT),
});

interface WorkspaceFormState extends BaseServerActionResponse {
  fieldErrors?: Partial<Record<keyof z.infer<typeof workspaceFormSchema>, string>>;
}

export async function saveWorkspaceAction(
  workspaceId: string | null,
  _prevState: WorkspaceFormState,
  formData: FormData
): Promise<WorkspaceFormState> {
  const supabase = await createClient();

  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    readmeContent: formData.get('readmeContent'),
  };

  const parsed = workspaceFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below.',
      fieldErrors: firstZodFlattenFieldErrors(parsed.error),
    };
  }

  const { title, description, readmeContent } = parsed.data;
  const payload = { title, description, readme_content: readmeContent };

  try {
    const { error } = workspaceId
      ? await supabase.from('workspaces').update(payload).eq('id', workspaceId)
      : await supabase.from('workspaces').insert(payload);

    if (error) throw error;

    revalidatePath('/');
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error(`${paths.workspaces.text} Action Error: ${error}`);
    return {
      success: false,
      error: getErrorMessage(error, DEFAULT_ERR_MESSAGE),
    };
  }
}

export async function deleteWorkspaceAction(
  workspaceId: string[] | null,
  _prevState: BaseServerActionResponse
): Promise<BaseServerActionResponse> {
  if (!workspaceId || workspaceId.length === 0) {
    return {
      success: false,
      error: 'No workspace selected for deletion.',
    };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.from('workspaces').delete().in('id', workspaceId);

    if (error) throw error;

    revalidatePath('/');
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error(`${paths.workspaces.text} Action Error: ${error}`);
    return {
      success: false,
      error: getErrorMessage(error, DEFAULT_ERR_MESSAGE),
    };
  }
}

const toggleReadmeSchema = z.object({
  isReadmeEnabled: z.boolean(),
});

export async function toggleReadmeEnabledWorkspaceAction(
  workspaceId: string | null,
  isReadmeEnabled: boolean
): Promise<BaseServerActionResponse> {
  if (!workspaceId) {
    return {
      success: false,
      error: 'No workspace selected for update.',
    };
  }

  const parsed = toggleReadmeSchema.safeParse({
    isReadmeEnabled,
  });

  if (!parsed.success) {
    return { success: false, error: 'Invalid value.' };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('workspaces')
      .update({
        is_readme_enabled: parsed.data.isReadmeEnabled,
      })
      .eq('id', workspaceId);

    if (error) throw error;

    revalidatePath('/');

    return { success: true, error: null };
  } catch (error) {
    console.error(`${paths.workspaces.text} Action Error:`, error);

    return {
      success: false,
      error: getErrorMessage(error, DEFAULT_ERR_MESSAGE),
    };
  }
}
