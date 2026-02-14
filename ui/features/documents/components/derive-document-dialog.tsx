import { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/components/shadcn/dialog";
import { Button } from "@/ui/components/shadcn/button";
import { Textarea } from "@/ui/components/shadcn/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/ui/components/shadcn/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { useAreas } from "@/ui/hooks/use-areas";
import { useUsers } from "@/ui/hooks/use-users";
import { useDeriveDocument } from "@/ui/hooks/use-documents";
import { useAuthStore } from "@/ui/stores/auth.store";
import { deriveDocumentSchema } from "@/ui/features/documents/schemas";
import type { DocumentWithRelations } from "@/ui/hooks/use-documents";

interface DeriveDocumentDialogProps {
  document: DocumentWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeriveDocumentDialog({
  document,
  open,
  onOpenChange,
  onSuccess,
}: DeriveDocumentDialogProps) {
  const { profile } = useAuthStore();
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  // Queries
  const { data: areas = [], isLoading: areasLoading } = useAreas();
  const { data: users = [] } = useUsers();
  const deriveMutation = useDeriveDocument();

  // Filter users by selected area
  const filteredUsers = selectedAreaId
    ? users.filter((u) => u.area_id === selectedAreaId && u.status === "active")
    : [];

  // Form
  const form = useForm({
    resolver: zodResolver(deriveDocumentSchema),
    defaultValues: {
      to_area_id: "",
      to_user_id: "",
      comment: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      form.reset({
        to_area_id: "",
        to_user_id: "",
        comment: "",
      });
      setSelectedAreaId("");
    }
  }, [open, form]);

  const onSubmit = async (data: {
    to_area_id: string;
    to_user_id?: string;
    comment: string;
  }) => {
    if (!document || !profile) return;

    try {
      await deriveMutation.mutateAsync({
        id: document.id,
        to_area_id: data.to_area_id,
        to_user_id: data.to_user_id || null,
        comment: data.comment,
        company_id: document.company_id,
        performed_by: profile.id,
        from_area_id: document.current_area_id,
      });

      toast.success("Documento derivado correctamente");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Error al derivar el documento");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Derivar Documento
          </DialogTitle>
          <DialogDescription>
            {document?.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Target Area */}
            <FormField
              control={form.control}
              name="to_area_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Destino *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedAreaId(value);
                      form.setValue("to_user_id", "");
                    }}
                    value={field.value}
                    disabled={areasLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target User */}
            <FormField
              control={form.control}
              name="to_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario Destino (opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedAreaId || filteredUsers.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedAreaId
                            ? "Primero seleccioná un área"
                            : filteredUsers.length === 0
                            ? "No hay usuarios en esta área"
                            : "Seleccionar usuario"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agregar notas o instrucciones..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={deriveMutation.isPending}>
                {deriveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Derivando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Derivar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
