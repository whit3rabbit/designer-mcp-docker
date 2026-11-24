'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Checkbox, RadioGroup } from '../../components/ui/Checkbox';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { DatePicker, DateRangePicker, DateTimePicker, InlineCalendar, TimePicker } from '../../components/ui/DatePicker';
import { DualListbox } from '../../components/ui/DualListbox';
import { AvatarUpload, FileUpload } from '../../components/ui/FileUpload';
import { FormField, OtpInput } from '../../components/ui/FormField';
import { InlineEdit } from '../../components/ui/InlineEdit';
import {
  CopyInput,
  FloatingInput,
  Input,
  InputGroup,
  InputGroupAddon,
  InputPassword,
  Textarea,
} from '../../components/ui/Input';
import { MaskedInput } from '../../components/ui/MaskedInput';
import { NumberInput } from '../../components/ui/NumberInput';
import { PhoneInput, type PhoneValue } from '../../components/ui/PhoneInput';
import { Rating } from '../../components/ui/Rating';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Combobox, Select, TagInput } from '../../components/ui/Select';
import { RangeSlider, Slider } from '../../components/ui/Slider';
import { OptionCardGroup } from '../../components/ui/Stepper';
import { Switch } from '../../components/ui/Switch';
import { ToggleGroup } from '../../components/ui/ToggleGroup';

export function FormInputsPage() {
  const [text, setText] = React.useState('');
  const [floatingName, setFloatingName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [framework, setFramework] = React.useState('nextjs');
  const [tags, setTags] = React.useState(['dashboard', 'wcag-aa']);
  const [date, setDate] = React.useState('2026-11-22');
  const [dateTime, setDateTime] = React.useState('2026-11-22T09:30');
  const [range, setRange] = React.useState({ start: '2026-11-01', end: '2026-11-22' });
  const [time, setTime] = React.useState('09:30');
  const [files, setFiles] = React.useState<File[]>([]);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [sliderVal, setSliderVal] = React.useState(65);
  const [priceRange, setPriceRange] = React.useState<[number, number]>([120, 680]);
  const [toggle, setToggle] = React.useState(true);
  const [agree, setAgree] = React.useState(true);
  const [plan, setPlan] = React.useState('pro');
  const [billing, setBilling] = React.useState<string | string[]>('monthly');
  const [qty, setQty] = React.useState(4);
  const [stars, setStars] = React.useState(4);
  const [otp, setOtp] = React.useState('482910');
  const [card, setCard] = React.useState('');
  const [phone, setPhone] = React.useState<PhoneValue>({ countryCode: 'US', dialCode: '+1', number: '' });
  const [accentColor, setAccentColor] = React.useState('var(--color-primary)');
  const [inlineTitle, setInlineTitle] = React.useState('Q4 Revenue Forecast');
  const [permissions, setPermissions] = React.useState<string[]>(['read-reports']);
  const [richHtml, setRichHtml] = React.useState('<p>OpenDesign rich text content.</p>');

  return (
    <div className="anim-in mx-auto max-w-5xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Standard & Advanced Input Primitives</CardTitle>
          <CardDescription>Complete 17-dashboard input suite governed by OpenDesign tokens.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <FormField id="inp-text" label="Text Input" hint="Supports sm, md, lg sizing">
            <Input id="inp-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Workspace name" />
          </FormField>
          <FormField id="inp-pass" label="Password with Strength Meter">
            <InputPassword
              id="inp-pass"
              showStrength
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create strong password"
            />
          </FormField>
          <FormField id="inp-group" label="Input Group (Prefix & Suffix)">
            <InputGroup>
              <InputGroupAddon align="start">https://</InputGroupAddon>
              <Input id="inp-group" placeholder="acme" />
              <InputGroupAddon align="end">.example.dev</InputGroupAddon>
            </InputGroup>
          </FormField>
          <FormField id="inp-copy" label="Copy-to-Clipboard Input">
            <CopyInput id="inp-copy" value="rd_live_98f3a1c2d4e50678" />
          </FormField>
          <div className="pt-1">
            <FloatingInput
              id="inp-float"
              label="Floating Label Input"
              value={floatingName}
              onChange={(e) => setFloatingName(e.target.value)}
            />
          </div>
          <FormField id="inp-mask" label="Masked Input (Credit Card)">
            <MaskedInput id="inp-mask" preset="credit-card" value={card} onChange={setCard} />
          </FormField>
          <FormField id="inp-phone" label="International Phone Input">
            <PhoneInput value={phone} onChange={setPhone} />
          </FormField>
          <FormField id="inp-color" label="Color Picker">
            <ColorPicker value={accentColor} onChange={setAccentColor} />
          </FormField>
          <FormField id="inp-select" label="Native Select">
            <Select
              id="inp-select"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              options={[
                { value: 'nextjs', label: 'Next.js App Router' },
                { value: 'react', label: 'React + Vite' },
                { value: 'vue', label: 'Vue 3 + Pinia' },
                { value: 'angular', label: 'Angular Signals' },
              ]}
            />
          </FormField>
          <FormField id="inp-combo" label="Searchable Combobox">
            <Combobox
              value={framework}
              onChange={setFramework}
              options={[
                { value: 'nextjs', label: 'Next.js App Router' },
                { value: 'react', label: 'React + Vite' },
                { value: 'vue', label: 'Vue 3 + Pinia' },
                { value: 'angular', label: 'Angular Signals' },
              ]}
            />
          </FormField>
          <FormField id="inp-tags" label="Multi-Select / Tags">
            <TagInput value={tags} onChange={setTags} />
          </FormField>
          <FormField id="inp-num" label="Number Stepper">
            <NumberInput value={qty} onChange={setQty} min={1} max={50} label="Seats" />
          </FormField>
          <FormField id="inp-seg" label="Segmented Control / Toggle Group">
            <ToggleGroup
              value={billing}
              onChange={setBilling}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
            />
          </FormField>
          <FormField id="inp-otp" label="OTP / Verification Code">
            <OtpInput value={otp} onChange={setOtp} />
          </FormField>
          <FormField id="inp-date" label="Date, Time & Datetime">
            <div className="flex flex-wrap gap-2">
              <DatePicker value={date} onChange={setDate} />
              <TimePicker value={time} onChange={setTime} />
              <DateTimePicker value={dateTime} onChange={setDateTime} />
            </div>
          </FormField>
          <FormField id="inp-range" label="Date Range with Presets">
            <DateRangePicker value={range} onChange={setRange} />
          </FormField>
          <FormField id="inp-cal" label="Inline Calendar Picker">
            <InlineCalendar value={date} onChange={setDate} />
          </FormField>
          <div className="space-y-4">
            <Slider value={sliderVal} onChange={setSliderVal} label="Threshold" unit="%" />
            <RangeSlider
              value={priceRange}
              onChange={setPriceRange}
              min={0}
              max={1000}
              step={10}
              unit="$"
              label="Budget Range"
              showInputs
            />
            <Switch checked={toggle} onCheckedChange={setToggle} label="Enable audit logging" />
            <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} label="Accept terms" />
            <Rating value={stars} onChange={setStars} label="Template rating" />
            <div className="space-y-1">
              <span style={{ color: 'var(--color-text)' }} className="block text-xs font-semibold">
                Inline Click-to-Edit
              </span>
              <InlineEdit value={inlineTitle} onSave={setInlineTitle} />
            </div>
          </div>
          <FormField id="inp-textarea" label="Textarea with Counter">
            <Textarea id="inp-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} maxCount={240} placeholder="Release notes..." />
          </FormField>
          <FormField id="inp-avatar" label="Avatar Upload">
            <AvatarUpload value={avatarUrl} onChange={(_file, url) => setAvatarUrl(url)} />
          </FormField>
          <FormField id="inp-radio" label="Radio Group">
            <RadioGroup
              name="plan"
              value={plan}
              onChange={setPlan}
              orientation="horizontal"
              options={[
                { value: 'starter', label: 'Starter' },
                { value: 'pro', label: 'Pro' },
                { value: 'enterprise', label: 'Enterprise' },
              ]}
            />
          </FormField>
          <FormField id="inp-upload" label="File Dropzone">
            <FileUpload files={files} onFilesChange={setFiles} />
          </FormField>
          <div className="md:col-span-2">
            <FormField id="inp-cards" label="Option Card Group">
              <OptionCardGroup
                name="deploy-tier"
                value={plan}
                onChange={(val) => setPlan(String(val))}
                columns={3}
                options={[
                  { value: 'starter', title: 'Starter', description: 'Up to 3 team members', icon: 'zap' },
                  { value: 'pro', title: 'Pro', description: 'Unlimited projects & SSO', icon: 'sparkles', badge: 'Popular' },
                  { value: 'enterprise', title: 'Enterprise', description: 'Dedicated VPC & SLA', icon: 'shield-alert' },
                ]}
              />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField id="inp-dual" label="Dual Listbox / Transfer List">
              <DualListbox
                value={permissions}
                onChange={setPermissions}
                availableLabel="Available Scopes"
                selectedLabel="Assigned Scopes"
                options={[
                  { value: 'read-reports', label: 'reports:read', description: 'View analytics dashboards' },
                  { value: 'write-reports', label: 'reports:write', description: 'Create & export reports' },
                  { value: 'manage-users', label: 'users:admin', description: 'Invite & suspend members' },
                  { value: 'manage-billing', label: 'billing:write', description: 'Update payment methods' },
                ]}
              />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField id="inp-rte" label="Rich Text Editor">
              <RichTextEditor value={richHtml} onChange={setRichHtml} />
            </FormField>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
