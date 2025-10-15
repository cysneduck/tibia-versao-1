import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  respawnCode: string;
  respawnName: string;
  duration: string;
  onConfirm: () => void;
}

export const ClaimDialog = ({
  open,
  onOpenChange,
  respawnCode,
  respawnName,
  duration,
  onConfirm,
}: ClaimDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim Respawn</DialogTitle>
          <DialogDescription>
            Are you sure you want to claim this respawn?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Respawn</p>
            <p className="font-medium text-foreground">
              {respawnCode} - {respawnName}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium text-foreground">{duration}</p>
          </div>
          
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
            <p className="text-sm text-foreground">
              This respawn will be marked as claimed by you and other members will see it's unavailable.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm Claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
