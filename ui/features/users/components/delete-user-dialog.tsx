import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/shadcn/alert-dialog";
import { Loader2 } from "lucide-react";

type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  isSelf: boolean;
  isLastAdmin: boolean;
  onConfirm: () => void;
  isPending: boolean;
};

export function DeleteUserDialog({
  open,
  onOpenChange,
  userName,
  isSelf,
  isLastAdmin,
  onConfirm,
  isPending,
}: DeleteUserDialogProps) {
  const cannotDelete = isSelf || isLastAdmin;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {cannotDelete ? "No se puede eliminar" : "¿Eliminar usuario?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSelf ? (
              <>No podés eliminar tu propia cuenta.</>
            ) : isLastAdmin ? (
              <>
                El usuario <strong>"{userName}"</strong> es el único
                administrador activo. No se puede eliminar.
              </>
            ) : (
              <>
                Estás por eliminar al usuario <strong>"{userName}"</strong>.
                Esta acción no se puede deshacer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cannotDelete ? (
            <AlertDialogCancel>Entendido</AlertDialogCancel>
          ) : (
            <>
              <AlertDialogCancel disabled={isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  onConfirm();
                }}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
