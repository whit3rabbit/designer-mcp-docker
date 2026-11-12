import { createRoot } from "react-dom/client";
import { MotionConfig, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "./shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "./shadcn/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./shadcn/dialog";

createRoot(document.querySelector("#root")!).render(
  <MotionConfig reducedMotion="user">
    <main className="mx-auto grid min-h-screen max-w-xl content-center p-6">
      <Card>
        <CardHeader><CardTitle>Offline design starter</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            React, Motion, Tailwind and shadcn are loaded from this directory.
          </motion.p>
          <Dialog>
            <DialogTrigger asChild><Button><Sparkles /> Open example</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Local dialog</DialogTitle>
                <DialogDescription>This example uses the bundled Radix components.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  </MotionConfig>,
);
