"use client";

import { useReservaFormContext } from "./ReservaFormContext";
import { MapaIgreja } from "./MapaIgreja";

export function ReservaFormMapa() {
  const {
    state: { formData },
    meta: { mapaUrl },
  } = useReservaFormContext();

  return <MapaIgreja mapaUrl={mapaUrl} espacosSelecionados={formData.espacos} />;
}
