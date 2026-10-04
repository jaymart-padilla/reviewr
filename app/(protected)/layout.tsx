import { getRequiredUser } from '@/lib/auth/get-user';
import { AuthProvider } from '@/lib/context/AuthProvider';

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getRequiredUser();

  return <AuthProvider user={user}>{children}</AuthProvider>;
}
