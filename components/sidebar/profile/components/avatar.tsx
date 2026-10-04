import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfile } from '@/lib/auth/get-user';

export function ProfileAvatar({
  user,
  initials,
}: {
  user: UserProfile;
  initials: string | null;
}) {
  return (
    <Avatar className="h-8 w-8 rounded-lg">
      <AvatarImage src={user.avatar ?? undefined} alt={user.name ?? 'Avatar'} />
      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
    </Avatar>
  );
}
