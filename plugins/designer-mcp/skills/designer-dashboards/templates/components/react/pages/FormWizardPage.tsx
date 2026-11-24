'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { DatePicker } from '../../components/ui/DatePicker';
import { FileUpload } from '../../components/ui/FileUpload';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { OptionCardGroup, Stepper } from '../../components/ui/Stepper';

const STEPS = [
  { id: 'plan', label: 'Workspace Type' },
  { id: 'details', label: 'Project Details' },
  { id: 'assets', label: 'Brand Assets' },
  { id: 'review', label: 'Review' },
];

export function FormWizardPage() {
  const [step, setStep] = React.useState(0);
  const [workspaceType, setWorkspaceType] = React.useState('saas');
  const [projectName, setProjectName] = React.useState('');
  const [region, setRegion] = React.useState('us-east');
  const [launchDate, setLaunchDate] = React.useState('2026-12-01');
  const [files, setFiles] = React.useState<File[]>([]);
  const [nameError, setNameError] = React.useState('');

  const handleNext = () => {
    if (step === 1 && projectName.trim().length < 2) {
      setNameError('Project name must be at least 2 characters.');
      toast.error('Please enter a project name before continuing.');
      return;
    }
    setNameError('');
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleSubmit = () => {
    toast.success(`Workspace "${projectName || 'Untitled'}" created!`);
  };

  return (
    <div className="anim-in mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Dashboard Workspace</CardTitle>
          <CardDescription>Multi-step wizard with per-step validation and option cards.</CardDescription>
          <div className="pt-3">
            <Stepper steps={STEPS} currentStep={step} onStepClick={setStep} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 0 && (
            <OptionCardGroup
              name="workspaceType"
              value={workspaceType}
              onChange={(val) => setWorkspaceType(String(val))}
              columns={2}
              options={[
                {
                  value: 'saas',
                  title: 'SaaS Analytics',
                  description: 'MRR, churn cohorts, and customer health dashboards.',
                  icon: 'bar-chart-3',
                  badge: 'Popular',
                },
                {
                  value: 'ops',
                  title: 'AI & Telemetry Ops',
                  description: 'Realtime latency streams, token usage, and incident logs.',
                  icon: 'activity',
                },
              ]}
            />
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="project-name" label="Project name" required error={nameError}>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  invalid={Boolean(nameError)}
                  placeholder="Northstar Console"
                />
              </FormField>
              <FormField id="region" label="Primary region">
                <Select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  options={[
                    { value: 'us-east', label: 'US East (Virginia)' },
                    { value: 'eu-west', label: 'EU West (Frankfurt)' },
                    { value: 'ap-south', label: 'AP South (Singapore)' },
                  ]}
                />
              </FormField>
              <FormField id="launch-date" label="Target launch date">
                <DatePicker value={launchDate} onChange={setLaunchDate} />
              </FormField>
            </div>
          )}

          {step === 2 && (
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              accept=".png,.svg,.jpg"
              label="Upload workspace logo or brand assets"
            />
          )}

          {step === 3 && (
            <dl
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
              className="space-y-2 border p-4 text-xs"
            >
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-text-muted)' }}>Template</dt>
                <dd className="font-semibold uppercase">{workspaceType}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-text-muted)' }}>Project Name</dt>
                <dd className="font-semibold">{projectName || 'Untitled'}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-text-muted)' }}>Region</dt>
                <dd className="font-semibold">{region}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-text-muted)' }}>Launch Date</dt>
                <dd className="tabular-nums font-semibold">{launchDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-text-muted)' }}>Attached Files</dt>
                <dd className="tabular-nums font-semibold">{files.length}</dd>
              </div>
            </dl>
          )}
        </CardContent>

        <CardFooter className="justify-between">
          <Button
            variant="outline"
            tone="neutral"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="solid" tone="primary" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button variant="solid" tone="success" onClick={handleSubmit}>
              Launch Workspace
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
