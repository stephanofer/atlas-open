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

type DeleteCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  isDefault: boolean;
  onConfirm: () => void;
  isPending: boolean;
};

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  categoryName,
  isDefault,
  onConfirm,
  isPending,
}: DeleteCategoryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDefault ? "No se puede eliminar" : "¿Eliminar categoría?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDefault ? (
              <>
                La categoría <strong>"{categoryName}"</strong> es una categoría
                por defecto del sistema y no puede ser eliminada.
              </>
            ) : (
              <>
                Estás por eliminar la categoría{" "}
                <strong>"{categoryName}"</strong>. Esta acción no se puede
                deshacer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {isDefault ? (
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
