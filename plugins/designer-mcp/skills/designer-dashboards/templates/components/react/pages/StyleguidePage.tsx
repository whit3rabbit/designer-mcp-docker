'use client';

import * as React from 'react';
import { WidgetCard } from '../../components/ui/WidgetCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Stepper } from '../../components/ui/Stepper';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Avatar, AvatarGroup } from '../../components/ui/Avatar';
import { Progress, ProgressRing } from '../../components/ui/Progress';
import { Switch } from '../../components/ui/Switch';
import { Slider } from '../../components/ui/Slider';
import { NumberInput } from '../../components/ui/NumberInput';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

const SEMANTIC_ROLES = ['primary', 'secondary', 'success', 'info', 'warning', 'error'] as const;

export function StyleguidePage() {
  const [step, setStep] = React.useState(1);
  const [enabled, setEnabled] = React.useState(true);
  const [volume, setVolume] = React.useState(64);
  const [count, setCount] = React.useState(3);

  return (
    <div className="anim-in space-y-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'UI Kit' }, { label: 'Styleguide' }]} />
      <WidgetCard title="Semantic & Soft Tonal Palette" subtitle="Live CSS variables from design-system/styles.css">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SEMANTIC_ROLES.map((role) => (
            <div key={role} className="space-y-2">
              <div
                style={{
                  backgroundColor: `var(--color-${role})`,
                  color: 'var(--color-on-solid)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="flex h-16 items-end p-2.5 text-xs font-semibold capitalize"
              >
                {role}
              </div>
              <div
                style={{
                  backgroundColor: `var(--color-${role}-surface)`,
                  borderColor: `var(--color-${role}-border)`,
                  color: `var(--color-${role})`,
                  borderRadius: 'var(--radius-md)',
                }}
                className="border px-2.5 py-1.5 text-[11px] font-medium"
              >
                --color-{role}-surface
              </div>
            </div>
          ))}
        </div>
      </WidgetCard>

      <WidgetCard title="Button Grammar & Badges" subtitle="solid | outline | tonal | ghost × semantic tones">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="solid" tone="primary">Solid Primary</Button>
            <Button variant="tonal" tone="primary">Tonal Primary</Button>
            <Button variant="outline" tone="primary">Outline Primary</Button>
            <Button variant="ghost" tone="primary">Ghost Primary</Button>
            <Button variant="solid" tone="error">Destructive</Button>
            <Button variant="solid" tone="primary" loading>Loading</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary" variant="solid">Solid</Badge>
            <Badge tone="success" variant="tonal">Active</Badge>
            <Badge tone="warning" variant="dot">Pending</Badge>
            <Badge tone="error" variant="outline">Failed</Badge>
            <Badge tone="info" variant="tonal">Beta</Badge>
          </div>
        </div>
      </WidgetCard>

      <WidgetCard title="Alerts & Wizard Stepper" subtitle="Accessible live regions and step progress">
        <div className="space-y-4">
          <Alert tone="info" title="OpenDesign Contract Active" dismissible>
            All colors, spacing, radii, and focus rings on this page are driven by design-system/theme.json.
          </Alert>
          <Stepper
            currentStep={step}
            onStepClick={setStep}
            steps={[
              { id: '1', label: 'Account' },
              { id: '2', label: 'Workspace' },
              { id: '3', label: 'Review' },
            ]}
          />
        </div>
      </WidgetCard>

      <WidgetCard title="Tabs, Avatars, Progress & Form Controls" subtitle="Shadcn-compatible primitives driven by OpenDesign tokens">
        <Tabs defaultValue="controls" variant="segmented">
          <TabsList>
            <TabsTrigger value="controls">Form Controls</TabsTrigger>
            <TabsTrigger value="display">Avatars & Progress</TabsTrigger>
          </TabsList>
          <TabsContent value="controls" className="grid gap-4 sm:grid-cols-3">
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              label="Realtime telemetry"
              description="Stream live events"
            />
            <Slider value={volume} onChange={setVolume} label="Threshold" unit="%" />
            <div>
              <NumberInput value={count} onChange={setCount} min={1} max={20} label="Workers" />
            </div>
          </TabsContent>
          <TabsContent value="display" className="flex flex-wrap items-center gap-6">
            <AvatarGroup
              items={[
                { alt: 'Alice Chen' },
                { alt: 'Bob Kumar' },
                { alt: 'Clara Diaz' },
                { alt: 'Dan Park' },
                { alt: 'Eva Lind' },
              ]}
              max={3}
            />
            <Avatar alt="System Admin" status="online" size="md" />
            <div className="w-48">
              <Progress value={volume} label="Storage quota" showValue tone="primary" />
            </div>
            <ProgressRing value={volume} tone="success" label="Completion" />
          </TabsContent>
        </Tabs>
      </WidgetCard>
    </div>
  );
}
