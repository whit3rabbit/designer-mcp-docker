import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./shadcn/accordion";
import { Badge } from "./shadcn/badge";
import { Button } from "./shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./shadcn/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./shadcn/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./shadcn/dropdown-menu";
import { Input } from "./shadcn/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./shadcn/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./shadcn/tooltip";

const demos = {
  accordion: <Accordion className="w-full" type="single" collapsible defaultValue="offline">
    <AccordionItem value="offline"><AccordionTrigger>Does it work offline?</AccordionTrigger>
      <AccordionContent>The preview and source are included in the image.</AccordionContent></AccordionItem>
    <AccordionItem value="source"><AccordionTrigger>Where is the source?</AccordionTrigger>
      <AccordionContent>Open the source panel below the preview.</AccordionContent></AccordionItem>
  </Accordion>,
  badge: <div className="flex gap-2"><Badge>Published</Badge><Badge variant="secondary">Draft</Badge><Badge variant="outline">Review</Badge></div>,
  button: <div className="flex gap-2"><Button>Continue</Button><Button variant="outline">Cancel</Button></div>,
  card: <Card className="w-full"><CardHeader><CardTitle>Project overview</CardTitle><CardDescription>Design library</CardDescription></CardHeader>
    <CardContent>Browse local components and reuse their source.</CardContent></Card>,
  dialog: <Dialog><DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>Project settings</DialogTitle><DialogDescription>Review your project preferences.</DialogDescription></DialogHeader></DialogContent></Dialog>,
  "dropdown-menu": <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Actions</Button></DropdownMenuTrigger>
    <DropdownMenuContent><DropdownMenuItem>Rename</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem></DropdownMenuContent></DropdownMenu>,
  input: <label className="grid w-full gap-2">Email<Input type="email" placeholder="name@example.com" /></label>,
  tabs: <Tabs className="w-full" defaultValue="overview"><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger></TabsList>
    <TabsContent value="overview">Project overview</TabsContent><TabsContent value="settings">Project settings</TabsContent></Tabs>,
  tooltip: <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline">More information</Button></TooltipTrigger>
    <TooltipContent>See component details</TooltipContent></Tooltip></TooltipProvider>,
};

function Example() {
  useEffect(() => { document.documentElement.dataset.preview = "ready"; }, []);
  const name = document.documentElement.dataset.demo as keyof typeof demos;
  return <main className="mx-auto grid min-h-screen max-w-sm place-items-center p-6">{demos[name]}</main>;
}
createRoot(document.querySelector("#preview-root")!).render(<Example />);
