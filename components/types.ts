interface BaseServerActionResponse {
  success: boolean;
  message?: string | null;
  error?: string | null;
}

type BaseDialogMenu = 'none' | 'edit' | 'delete';

interface ServerSearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
} // https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional

export type { BaseServerActionResponse, BaseDialogMenu, ServerSearchParams };
