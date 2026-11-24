'use client';

import * as React from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { FloatingInput, Input, InputGroup, InputGroupAddon } from '../../components/ui/Input';

export function FormLayoutsPage() {
  return (
    <div className="anim-in mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stacked Layout (Default)</CardTitle>
          <CardDescription>Label above input for standard dashboard forms.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="s-first" label="First name" required>
            <Input id="s-first" placeholder="Elena" />
          </FormField>
          <FormField id="s-last" label="Last name" required>
            <Input id="s-last" placeholder="Rostova" />
          </FormField>
          <FormField id="s-site" label="Workspace URL">
            <InputGroup>
              <InputGroupAddon align="start">https://</InputGroupAddon>
              <Input id="s-site" placeholder="northstar" />
              <InputGroupAddon align="end">.app</InputGroupAddon>
            </InputGroup>
          </FormField>
          <FloatingInput id="s-role" label="Floating Role Label" />
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="solid" tone="primary" size="sm">Submit</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horizontal Layout (Settings)</CardTitle>
          <CardDescription>Label beside input on desktop, stacked on mobile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField id="h-org" label="Organization" layout="horizontal" required>
            <Input id="h-org" placeholder="Northstar Analytics" />
          </FormField>
          <FormField id="h-domain" label="Custom domain" layout="horizontal" hint="CNAME points to edge.example">
            <Input id="h-domain" placeholder="dash.northstar.example" />
          </FormField>
        </CardContent>
      </Card>
    </div>
  );
}
