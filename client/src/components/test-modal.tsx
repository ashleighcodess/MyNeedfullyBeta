import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function TestModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-4 right-4 z-50 bg-red-500 text-white"
          onClick={() => setOpen(true)}
        >
          Test Modal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test Modal</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>This is a test modal to check if modals are working correctly.</p>
          <Button onClick={() => setOpen(false)} className="mt-4">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}