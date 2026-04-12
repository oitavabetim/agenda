"use client";

import { createContext, use, ReactNode } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservaSchema, ReservaFormData } from "@/lib/validation/reserva";
import { formatPhone } from "@/lib/utils/format-phone";
import { criarReserva } from "./actions";

// Interfaces do contexto (Vercel: state-context-interface)
interface ReservaFormState {
  formData: ReservaFormData;
  isSubmitting: boolean;
  isSubmitSuccessful: boolean;
  isDirty: boolean;
  errors: Record<string, { message?: string }>;
}

interface ReservaFormActions {
  submit: () => Promise<void>;
  reset: () => void;
  updateField: <K extends keyof ReservaFormData>(
    field: K,
    value: ReservaFormData[K]
  ) => void;
  toggleEspaco: (espacoId: string) => void;
}

interface ReservaFormMeta {
  usuarioNome: string;
  usuarioEmail: string;
  tenantId: string;
  mapaUrl: string;
  espacosDisponiveis: {
    id: string;
    nome: string;
    descricao: string;
    capacidade: number | null;
  }[];
}

interface ReservaFormContextValue {
  state: ReservaFormState;
  actions: ReservaFormActions;
  meta: ReservaFormMeta;
  form: UseFormReturn<ReservaFormData>;
}

const ReservaFormContext = createContext<ReservaFormContextValue | null>(null);

// Hook para usar o contexto (React 19 - usa `use()`)
export function useReservaFormContext(): ReservaFormContextValue {
  const context = use(ReservaFormContext);
  if (!context) {
    throw new Error(
      "useReservaFormContext deve ser usado dentro de ReservaFormProvider"
    );
  }
  return context;
}

// Provider - único lugar que conhece react-hook-form (Vercel: state-decouple-implementation)
interface ReservaFormProviderProps {
  children: ReactNode;
  usuarioNome: string;
  usuarioEmail: string;
  tenantId: string;
  mapaUrl: string;
  espacosDisponiveis: {
    id: string;
    nome: string;
    descricao: string;
    capacidade: number | null;
  }[];
  onSuccess?: () => void;
}

export function ReservaFormProvider({
  children,
  usuarioNome,
  usuarioEmail,
  tenantId,
  mapaUrl,
  espacosDisponiveis,
  onSuccess,
}: ReservaFormProviderProps) {
  const form = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      programacao: "",
      responsavel: usuarioNome,
      telefone: "",
      observacoes: "",
      dataInicio: "",
      horarioInicio: "",
      horarioFim: "",
      recorrente: false,
      recorrenciaTipo: "",
      recorrenciaDataTermino: "",
      espacos: [],
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting, isSubmitSuccessful, isDirty, errors },
  } = form;

  // Handlers
  const onSubmit = async (data: ReservaFormData) => {
    try {
      const result = await criarReserva({
        ...data,
        responsavelEmail: usuarioEmail,
        tenantId,
        recorrenciaTipo:
          data.recorrente &&
          (data.recorrenciaTipo === "semanal" ||
            data.recorrenciaTipo === "mensal")
            ? data.recorrenciaTipo
            : undefined,
      });

      if (result.success) {
        reset();
        onSuccess?.();
        // Rolar para o topo para mostrar feedback de sucesso
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Mostrar erro no formulário em vez de lançar exceção
        form.setError("root", {
          type: "server",
          message: result.error || "Erro ao criar reserva",
        });
        // Rolar para o topo para mostrar feedback de erro
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      // Erro inesperado
      form.setError("root", {
        type: "server",
        message: "Erro ao processar reserva. Tente novamente.",
      });
      // Rolar para o topo para mostrar feedback de erro
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleReset = () => {
    reset({
      programacao: "",
      responsavel: usuarioNome,
      telefone: "",
      observacoes: "",
      dataInicio: "",
      horarioInicio: "",
      horarioFim: "",
      recorrente: false,
      recorrenciaTipo: "",
      recorrenciaDataTermino: "",
      espacos: [],
    });
  };

  const updateField = <K extends keyof ReservaFormData>(
    field: K,
    value: ReservaFormData[K]
  ) => {
    setValue(field, value as any, { shouldValidate: true, shouldDirty: true });
  };

  // Handler especializado para toggle de espaços (Vercel: compound components)
  const toggleEspaco = (espacoId: string) => {
    const currentEspacos = watch("espacos");
    const novosEspacos = currentEspacos.includes(espacoId)
      ? currentEspacos.filter((id) => id !== espacoId)
      : [...currentEspacos, espacoId];
    setValue("espacos", novosEspacos, { shouldValidate: true, shouldDirty: true });
  };

  // Handler especializado para telefone com formatação
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setValue("telefone", formatted, { shouldValidate: true, shouldDirty: true });
  };

  const contextValue: ReservaFormContextValue = {
    state: {
      formData: watch(),
      isSubmitting,
      isSubmitSuccessful,
      isDirty,
      errors,
    },
    actions: {
      submit: handleSubmit(onSubmit),
      reset: handleReset,
      updateField,
      toggleEspaco,
    },
    meta: {
      usuarioNome,
      usuarioEmail,
      tenantId,
      mapaUrl,
      espacosDisponiveis,
    },
    form,
  };

  return (
    <ReservaFormContext value={contextValue}>
      {children}
    </ReservaFormContext>
  );
}
