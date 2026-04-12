"use client";

// Arquivo de exportação para o Compound Component ReservaForm
// Este arquivo re-exporta todos os componentes do formulário de reserva

export { ReservaFormProvider, useReservaFormContext } from "./ReservaFormContext";
export { ReservaFormFrame } from "./ReservaFormFrame";
export { ReservaFormProgramacao } from "./ReservaFormProgramacao";
export { ReservaFormDataHorario } from "./ReservaFormDataHorario";
export { ReservaFormRecorrencia } from "./ReservaFormRecorrencia";
export { ReservaFormEspacos } from "./ReservaFormEspacos";
export { ReservaFormMapa } from "./ReservaFormMapa";
export { ReservaFormFooter } from "./ReservaFormFooter";
export { RecorrenciaToggle } from "./RecorrenciaToggle";

// Compound Component object para uso conveniente
import { ReservaFormProvider } from "./ReservaFormContext";
import { ReservaFormFrame } from "./ReservaFormFrame";
import { ReservaFormProgramacao } from "./ReservaFormProgramacao";
import { ReservaFormDataHorario } from "./ReservaFormDataHorario";
import { ReservaFormRecorrencia } from "./ReservaFormRecorrencia";
import { ReservaFormEspacos } from "./ReservaFormEspacos";
import { ReservaFormMapa } from "./ReservaFormMapa";
import { ReservaFormFooter } from "./ReservaFormFooter";
import { RecorrenciaToggle } from "./RecorrenciaToggle";

export const ReservaForm = {
  Provider: ReservaFormProvider,
  Frame: ReservaFormFrame,
  Programacao: ReservaFormProgramacao,
  DataHorario: ReservaFormDataHorario,
  RecorrenciaToggle: RecorrenciaToggle,
  Recorrencia: ReservaFormRecorrencia,
  Espacos: ReservaFormEspacos,
  Mapa: ReservaFormMapa,
  Footer: ReservaFormFooter,
};
