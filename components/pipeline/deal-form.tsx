"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STAGE_CONFIG, STAGE_ORDER } from "./pipeline-board";
import type { Deal, DealStage, Lead } from "@/types";

const dealSchema = z.object({
  title: z.string().min(2, "Título precisa ter ao menos 2 caracteres"),
  value: z
    .number({ error: "Informe um valor válido" })
    .min(1, "Valor deve ser maior que zero"),
  leadId: z.string().min(1, "Selecione um lead"),
  stage: z.enum([
    "novo_lead",
    "contato_realizado",
    "proposta_enviada",
    "negociacao",
    "fechado_ganho",
    "fechado_perdido",
  ]),
  deadline: z.string().optional(),
});

export type DealFormData = z.infer<typeof dealSchema>;

interface DealFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DealFormData) => void;
  onDelete?: (id: string) => void;
  deal?: Deal | null;
  leads: Lead[];
  defaultStage?: DealStage;
  isSubmitting?: boolean;
}

export function DealForm({
  open,
  onClose,
  onSubmit,
  onDelete,
  deal,
  leads,
  defaultStage = "novo_lead",
  isSubmitting = false,
}: DealFormProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isEditing = Boolean(deal);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      value: undefined,
      leadId: "",
      stage: defaultStage,
      deadline: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (deal) {
        reset({
          title: deal.title,
          value: deal.value,
          leadId: deal.leadId,
          stage: deal.stage,
          deadline: deal.deadline ?? "",
        });
      } else {
        reset({
          title: "",
          value: undefined,
          leadId: "",
          stage: defaultStage,
          deadline: "",
        });
      }
    }
  }, [open, deal, defaultStage, reset]);

  function handleFormSubmit(data: DealFormData) {
    onSubmit(data);
  }

  function handleDelete() {
    if (deal && onDelete) {
      onDelete(deal.id);
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]">
          <SheetHeader className="border-b border-gray-200 px-6 py-5">
            <SheetTitle className="text-base font-semibold text-gray-900">
              {isEditing ? "Editar Negócio" : "Novo Negócio"}
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              {isEditing
                ? "Atualize as informações do negócio."
                : "Preencha os dados para criar um novo negócio no pipeline."}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex flex-col gap-5">
                {/* Título */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="deal-title">
                    Título <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deal-title"
                    placeholder="Ex: Implementação CRM Enterprise"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {/* Valor */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="deal-value">
                    Valor (R$) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deal-value"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Ex: 48000"
                    {...register("value", { valueAsNumber: true })}
                  />
                  {errors.value && (
                    <p className="text-xs text-red-500">{errors.value.message}</p>
                  )}
                </div>

                {/* Lead */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="deal-lead">
                    Lead <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="leadId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="deal-lead">
                          <SelectValue placeholder="Selecione um lead" />
                        </SelectTrigger>
                        <SelectContent>
                          {leads.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name}
                              {lead.company && (
                                <span className="ml-1 text-gray-400">
                                  — {lead.company}
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.leadId && (
                    <p className="text-xs text-red-500">{errors.leadId.message}</p>
                  )}
                </div>

                {/* Etapa e Prazo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="deal-stage">
                      Etapa <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="stage"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="deal-stage">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGE_ORDER.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {STAGE_CONFIG[stage].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.stage && (
                      <p className="text-xs text-red-500">{errors.stage.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="deal-deadline">Prazo</Label>
                    <Input
                      id="deal-deadline"
                      type="date"
                      {...register("deadline")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
              {isEditing && onDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  {isEditing ? "Salvar" : "Criar negócio"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir negócio</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <strong>{deal?.title}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
