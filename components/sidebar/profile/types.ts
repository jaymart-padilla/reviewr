interface FormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  pendingAvatarFile: File | null;
  avatarPreview: string | null;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
  general?: string;
}

interface ShowPasswordStates {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}

export type { FormData, FormErrors, ShowPasswordStates };
