'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';

export function DocsPage() {
  return (
    <div className="anim-in mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Engineering Guide</CardTitle>
          <CardDescription>In-app documentation covering tokens, Nav IR, DataGrid, and accessibility.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tokens" variant="pills">
            <TabsList>
              <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
              <TabsTrigger value="nav">Navigation IR</TabsTrigger>
              <TabsTrigger value="a11y">WCAG 2.1 AA</TabsTrigger>
            </TabsList>
            <TabsContent value="tokens" className="space-y-2 text-xs leading-relaxed">
              <p>All visual values flow from <code>design-system/DESIGN.md</code> and <code>theme.json</code> into <code>styles.css</code>.</p>
              <p>Never hardcode raw hex literals or pure black inside UI components.</p>
            </TabsContent>
            <TabsContent value="nav" className="space-y-2 text-xs leading-relaxed">
              <p><code>src/configs/navigation.config.ts</code> drives sidebar links, breadcrumbs, page titles, and RBAC authority filtering.</p>
            </TabsContent>
            <TabsContent value="a11y" className="space-y-2 text-xs leading-relaxed">
              <p>Run <code>node scripts/verify-dashboard.mjs .</code> before shipping to validate contrast, RTL logical properties, and ARIA labels.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
