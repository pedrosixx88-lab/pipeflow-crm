"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { Lead, LeadStatus } from "@/types";
import { STATUS_CONFIG } from "@/components/leads/status-badge";

const leadSchema = z.object({
  name: z.string().min(2, "Nome precisa ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(["novo", "contato_realizado", "proposta_enviada", "negociacao", "fechado_ganho", "fechado_perdido"]),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  onSubmit: (data: LeadFormValues, id?: string) => void;
  onDelete?: (id: string) => void;
  isSubmitting?: boolean;
}

export function LeadForm({ open, onOpenChange, lead, onSubmit, onDelete, isSubmitting = false }: LeadFormProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isEditing = Boolean(lead);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", role: "", status: "novo", notes: "" },
  });

  useEffect(() => {
    if (open) {
      reset(lead
        ? { name: lead.name, email: lead.email, phone: lead.phone ?? "", company: lead.company ?? "", role: lead.role ?? "", status: lead.status, notes: "" }
        : { name: "", email: "", phone: "", company: "", role: "", status: "novo", notes: "" }
      );
    }
  }, [open, lead, reset]);

  const statusValue = watch("status");

  function handleDelete() {
    if (lead && onDelete) { onDelete(lead.id); setShowDeleteDialog(false); }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]">
          <SheetHeader className="border-b border-border px-6 py-5">
            <SheetTitle className="text-base font-semibold text-foreground">
              {isEditing ? "Editar Lead" : "Novo Lead"}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {isEditing ? "Atualize as informações do lead." : "Preencha os dados para cadastrar um novo lead."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit((d) => onSubmit(d, lead?.id))} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Nome <span className="text-destructive">*</span></Label>
                  <Input id="name" placeholder="Ex: Maria Silva" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" placeholder="maria@empresa.com.br" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(11) 99999-9999" {...register("phone")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" placeholder="Empresa Ltda." {...register("company")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="role">Cargo</Label>
                    <Input id="role" placeholder="CEO, Gerente..." {...register("role")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="status">Status</Label>
                    <Select value={statusValue} onValueChange={(v) => setValue("status", v as LeadStatus)}>
                      <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" placeholder="Contexto adicional sobre o lead..." rows={4} className="resize-none" {...register("notes")} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              {isEditing && onDelete ? (
                <Button type="button" variant="ghost" size="sm" className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </Button>
              ) : <div />}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="gap-2">
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isEditing ? "Salvar" : "Criar lead"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir lead</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{lead?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type { LeadFormValues };
