'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { AvatarUpload } from '../../components/ui/FileUpload';
import { FormField } from '../../components/ui/FormField';
import { Input, InputPassword } from '../../components/ui/Input';
import { PhoneInput, type PhoneValue } from '../../components/ui/PhoneInput';
import { Select } from '../../components/ui/Select';
import { Switch } from '../../components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  role: z.string().min(1),
  timezone: z.string().min(1),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function SettingsPage() {
  const [digestEnabled, setDigestEnabled] = React.useState(true);
  const [securityAlerts, setSecurityAlerts] = React.useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [phone, setPhone] = React.useState<PhoneValue>({ countryCode: 'US', dialCode: '+1', number: '(555) 234-8910' });
  const [newPassword, setNewPassword] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: 'Elena Rostova',
      email: 'elena@northstar.example',
      role: 'admin',
      timezone: 'America/Chicago',
    },
  });

  const onSaveProfile = async (data: ProfileValues) => {
    await new Promise((r) => setTimeout(r, 250));
    toast.success(`Saved profile settings for ${data.fullName}`);
  };

  return (
    <div className="anim-in mx-auto max-w-4xl space-y-6">
      <div>
        <h1
          style={{ color: 'var(--color-text)', fontWeight: 'var(--font-heading-weight)' }}
          className="text-xl"
        >
          Account Settings
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="mt-1 text-xs">
          Manage your profile, security credentials, notification preferences, and billing plan.
        </p>
      </div>

      <Tabs defaultValue="profile" variant="underline">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form
            onSubmit={handleSubmit(onSaveProfile, () =>
              toast.error('Please fix the highlighted profile fields.'),
            )}
          >
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar alt="Elena Rostova" size="lg" status="online" />
                    <div>
                      <CardTitle>Public Profile</CardTitle>
                      <CardDescription>Displayed across audit logs and team mentions.</CardDescription>
                    </div>
                  </div>
                  <AvatarUpload
                    value={avatarUrl}
                    onChange={(_file, url) => setAvatarUrl(url)}
                    fallbackText="ER"
                    label="Change avatar"
                  />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField id="fullName" label="Full name" required error={errors.fullName?.message}>
                  <Input id="fullName" invalid={Boolean(errors.fullName)} {...register('fullName')} />
                </FormField>
                <FormField id="email" label="Work email" required error={errors.email?.message}>
                  <Input id="email" type="email" invalid={Boolean(errors.email)} {...register('email')} />
                </FormField>
                <FormField id="phone" label="Phone number">
                  <PhoneInput value={phone} onChange={setPhone} />
                </FormField>
                <FormField id="role" label="Workspace role">
                  <Select
                    id="role"
                    options={[
                      { value: 'admin', label: 'Administrator' },
                      { value: 'editor', label: 'Editor' },
                      { value: 'viewer', label: 'Viewer' },
                    ]}
                    {...register('role')}
                  />
                </FormField>
                <FormField id="timezone" label="Timezone">
                  <Select
                    id="timezone"
                    options={[
                      { value: 'America/Chicago', label: 'America/Chicago (CST)' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                      { value: 'Europe/London', label: 'Europe/London (GMT)' },
                    ]}
                    {...register('timezone')}
                  />
                </FormField>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" variant="solid" tone="primary" loading={isSubmitting}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password & Multi-Factor Authentication</CardTitle>
              <CardDescription>Protect your account with a strong password and TOTP 2FA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="current-password" label="Current password">
                  <InputPassword id="current-password" placeholder="••••••••" />
                </FormField>
                <FormField id="new-password" label="New password">
                  <InputPassword
                    id="new-password"
                    showStrength
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 12 characters"
                  />
                </FormField>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={(v) => {
                  setTwoFactorEnabled(v);
                  toast.info(v ? '2FA enabled for your account.' : '2FA disabled.');
                }}
                label="Require 2FA on sign-in"
                description="Prompt for a 6-digit authenticator code on new devices."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Choose which events trigger email or in-app alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Switch
                checked={digestEnabled}
                onCheckedChange={setDigestEnabled}
                label="Weekly analytics digest"
                description="Summary of KPIs and anomalies sent every Monday morning."
              />
              <Switch
                checked={securityAlerts}
                onCheckedChange={setSecurityAlerts}
                label="Security & RBAC alerts"
                description="Immediate alert when API keys or role permissions change."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>Enterprise Plan</CardTitle>
                  <CardDescription>Next billing cycle renews on Dec 15, 2026.</CardDescription>
                </div>
                <Badge tone="success" variant="tonal">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs">
              <p style={{ color: 'var(--color-text-muted)' }}>
                12 of 20 seats used · Unlimited dashboards · Priority SLA
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
