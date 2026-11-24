'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Checkbox } from '../../components/ui/Checkbox';
import { Dialog } from '../../components/ui/Dialog';

interface RoleRecord {
  id: string;
  name: string;
  users: number;
  permissions: string[];
}

const ALL_PERMISSIONS = ['analytics:read', 'users:write', 'billing:manage', 'roles:admin'];

export function RolesPage() {
  const [roles, setRoles] = React.useState<RoleRecord[]>([
    { id: 'admin', name: 'Administrator', users: 3, permissions: ALL_PERMISSIONS },
    { id: 'editor', name: 'Editor', users: 8, permissions: ['analytics:read', 'users:write'] },
    { id: 'viewer', name: 'Viewer', users: 14, permissions: ['analytics:read'] },
  ]);
  const [editing, setEditing] = React.useState<RoleRecord | null>(null);

  const togglePerm = (perm: string) => {
    if (!editing) return;
    const has = editing.permissions.includes(perm);
    setEditing({
      ...editing,
      permissions: has ? editing.permissions.filter((p) => p !== perm) : [...editing.permissions, perm],
    });
  };

  return (
    <div className="anim-in mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions (RBAC)</CardTitle>
          <CardDescription>Single-source authority roles mirrored in navigation.config.ts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.id}
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="flex flex-col justify-between gap-4 border p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{role.name}</h3>
                    <Badge tone="primary" variant="tonal" className="tabular-nums">
                      {role.users} users
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {role.permissions.map((p) => (
                      <Badge key={p} tone="neutral" variant="outline" size="xs">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline" tone="neutral" size="xs" onClick={() => setEditing(role)}>
                  Edit Permissions
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={`Edit ${editing?.name ?? ''} Permissions`}
        footer={
          <>
            <Button variant="ghost" tone="neutral" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              tone="primary"
              size="sm"
              onClick={() => {
                if (!editing) return;
                setRoles((prev) => prev.map((r) => (r.id === editing.id ? editing : r)));
                toast.success(`Updated permissions for ${editing.name}`);
                setEditing(null);
              }}
            >
              Save Role
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {ALL_PERMISSIONS.map((perm) => (
            <Checkbox
              key={perm}
              checked={editing?.permissions.includes(perm) ?? false}
              onChange={() => togglePerm(perm)}
              label={perm}
            />
          ))}
        </div>
      </Dialog>
    </div>
  );
}
