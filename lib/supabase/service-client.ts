import { createClient } from '@supabase/supabase-js';

// Runs in the background outside the user's request context. Uses service role key to bypass RLS for protected db requests to go through.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
