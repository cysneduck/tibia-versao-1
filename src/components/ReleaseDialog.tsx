import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  respawnCode: string;
  respawnName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ReleaseDialog = ({
  open,
  onOpenChange,
  respawnCode,
  respawnName,
  onConfirm,
  isLoading = false,
}: ReleaseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Respawn</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this respawn early?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Respawn</p>
            <p className="font-medium text-foreground">
              {respawnCode} - {respawnName}
            </p>
          </div>
          
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-foreground">
              This will make the respawn available for other members immediately.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Leaving..." : "Leave Respawn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
