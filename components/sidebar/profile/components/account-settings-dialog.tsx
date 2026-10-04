'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { Camera, Loader2, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthProvider';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { getInitials } from '@/components/sidebar/profile/lib/getInitials';
import {
  CONSTANTS,
  updateEmail,
  updatePassword,
  updateProfile,
  uploadAvatar,
} from '@/components/sidebar/profile/lib/account-settings-dialog-helper';
import type { FormData, FormErrors, ShowPasswordStates } from '@/components/sidebar/profile/types';

export function AccountSettingsDialog() {
  const user = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: user.name ?? '',
    email: user.email ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    pendingAvatarFile: null,
    avatarPreview: user.avatar ?? null,
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar ?? null);

  const [showPassword, setShowPassword] = useState<ShowPasswordStates>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  // ── Form & error helpers ─────────────────────────────────────────────────────────────

  function patchForm<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function setFieldError(field: keyof FormErrors, message: string) {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }

  function clearErrors() {
    setErrors({});
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CONSTANTS.ALLOWED_MIME_TYPES.includes(file.type)) {
      setFieldError('avatar', 'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF.');
      e.target.value = '';
      return;
    }
    if (file.size > CONSTANTS.MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFieldError('avatar', `File too large. Maximum size is ${CONSTANTS.MAX_FILE_SIZE_MB} MB.`);
      e.target.value = '';
      return;
    }

    if (formData.avatarPreview) URL.revokeObjectURL(formData.avatarPreview);
    setFormData((prev) => ({
      ...prev,
      pendingAvatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
    setErrors((prev) => ({ ...prev, avatar: undefined }));
    e.target.value = '';
  }

  function clearPendingAvatar() {
    if (formData.avatarPreview) URL.revokeObjectURL(formData.avatarPreview);
    setFormData((prev) => ({
      ...prev,
      pendingAvatarFile: null,
      avatarPreview: null,
    }));
  }

  async function handleUploadAvatar(userId: string, file: File): Promise<string> {
    try {
      return await uploadAvatar(userId, file);
    } catch (error: unknown) {
      setFieldError('avatar', getErrorMessage(error, CONSTANTS.DEFAULT_ERR_MESSAGE));
      throw error;
    }
  }

  async function handleUpdateProfile(userId: string): Promise<void> {
    let finalAvatarUrl = avatarUrl;

    if (formData.pendingAvatarFile) {
      finalAvatarUrl = await handleUploadAvatar(userId, formData.pendingAvatarFile);
      setAvatarUrl(finalAvatarUrl);
      if (formData.avatarPreview) URL.revokeObjectURL(formData.avatarPreview);
      setFormData((prev) => ({
        ...prev,
        pendingAvatarFile: null,
        avatarPreview: null,
      }));
    }

    if (!formData.name) {
      setFieldError('name', 'Name is required.');
      throw new Error('Name is required.');
    }

    try {
      await updateProfile(userId, {
        name: formData.name.trim(),
        avatar: finalAvatarUrl,
      });
    } catch (error: unknown) {
      setFieldError('general', getErrorMessage(error, CONSTANTS.DEFAULT_ERR_MESSAGE));
      throw error;
    }
  }

  async function handleUpdateEmail(): Promise<void> {
    try {
      await updateEmail(formData.email.trim());
    } catch (error: unknown) {
      setFieldError('email', getErrorMessage(error, CONSTANTS.DEFAULT_ERR_MESSAGE));
      throw error;
    }
  }

  async function handleUpdatePassword(): Promise<void> {
    try {
      await updatePassword(formData);
    } catch (err: unknown) {
      setFieldError('password', getErrorMessage(err, CONSTANTS.DEFAULT_ERR_MESSAGE));
      throw err;
    }
  }

  async function handleSave() {
    if (!user) return;
    clearErrors();
    setSaving(true);

    const emailChanged = formData.email.trim() !== user.email;
    const passwordFilled = !!formData.newPassword || !!formData.confirmPassword;

    try {
      await handleUpdateProfile(user.id);

      if (emailChanged) {
        await handleUpdateEmail();
        toast.success('Confirmation email sent. Check both inboxes to confirm the change.');
      }

      if (passwordFilled) {
        await handleUpdatePassword();
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        toast.success('Password updated.');
      }

      if (!emailChanged && !passwordFilled) {
        toast.success('Profile saved.');
      }

      router.refresh();
    } catch {
      // errors already set via setFieldError in sub-handlers
    } finally {
      setSaving(false);
    }
  }

  const displayAvatar = formData.avatarPreview ?? avatarUrl;

  return (
    <DialogContent className="max-h-[90vh] w-full max-w-md overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-center text-xl font-semibold">Profile Settings</DialogTitle>
        <DialogDescription className="text-muted-foreground text-center text-sm">
          Update your account details and preferences
        </DialogDescription>
      </DialogHeader>

      {!user ? (
        <div className="flex justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : (
        <FieldGroup className="gap-6 pt-2">
          {/* ── Avatar ── 
            Kept as a plain flex column on purpose: <Field> forces its children to
            full width, which would break the centered avatar layout. 
          */}
          <div className="flex flex-col items-center gap-3">
            <div className="group relative">
              <Avatar className="ring-border h-20 w-20 ring-2">
                <AvatarImage src={displayAvatar ?? undefined} alt={formData.name || 'Avatar'} />
                <AvatarFallback className="bg-muted text-lg font-medium">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Change avatar"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>

              {formData.pendingAvatarFile && (
                <button
                  onClick={clearPendingAvatar}
                  className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full"
                  aria-label="Remove selected photo"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={CONSTANTS.ALLOWED_MIME_TYPES.join(',')}
              className="hidden"
              onChange={handleAvatarSelect}
            />

            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Choose photo
            </Button>

            <FieldDescription className="text-center text-xs leading-relaxed">
              Supported formats:{' '}
              {CONSTANTS.ALLOWED_MIME_TYPES.map((types) => {
                return types.split('/').pop();
              }).join(', ')}
              .
              <br />
              Maximum file size: {CONSTANTS.MAX_FILE_SIZE_MB} MB.
            </FieldDescription>

            {errors.avatar && <FieldError className="text-xs">{errors.avatar}</FieldError>}
          </div>

          {/* ── Account details ── */}
          <FieldSet>
            <FieldLegend>Account details</FieldLegend>
            <FieldDescription className="text-xs">
              Manage the personal details linked to your account.
            </FieldDescription>

            <FieldGroup className="gap-3">
              {/* Name */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => patchForm('name', e.target.value)}
                  placeholder="Your Name"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <FieldError className="text-xs">{errors.name}</FieldError>}
              </Field>

              {/* Email */}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => patchForm('email', e.target.value)}
                  placeholder="your@email.com"
                  aria-invalid={!!errors.email}
                />
                {errors.email ? (
                  <FieldError className="text-xs">{errors.email}</FieldError>
                ) : (
                  <FieldDescription className="text-xs">
                    You&apos;ll receive a confirmation link at both addresses if changed.
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          {/* ── Password ── */}
          <FieldSet>
            <FieldLegend>Change password</FieldLegend>
            <FieldDescription className="text-xs">
              Leave these fields blank to keep your current password.
            </FieldDescription>
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="current-password">Current password</FieldLabel>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword.currentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => patchForm('currentPassword', e.target.value)}
                    placeholder="Current Password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        currentPassword: !prev.currentPassword,
                      }))
                    }
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                    aria-label={showPassword.currentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword.currentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword.newPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => patchForm('newPassword', e.target.value)}
                    placeholder="Min. 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        newPassword: !prev.newPassword,
                      }))
                    }
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                    aria-label={showPassword.newPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword.newPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword.confirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => patchForm('confirmPassword', e.target.value)}
                    placeholder="Repeat new password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword,
                      }))
                    }
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                    aria-label={showPassword.confirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword.confirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <FieldError className="text-xs">{errors.password}</FieldError>}
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* ── General error ── */}
          {errors.general && (
            <FieldError className="text-center text-xs">{errors.general}</FieldError>
          )}

          {/* ── Single save button ── */}
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </FieldGroup>
      )}
    </DialogContent>
  );
}
