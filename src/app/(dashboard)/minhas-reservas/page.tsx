import { Metadata } from "next";
import { listarMinhasReservas } from "./actions";
import { MinhasReservasClient } from "./_components/MinhasReservasClient";

export const metadata: Metadata = {
  title: "Minhas Reservas",
  description: "Visualize e gerencie suas reservas de espaços",
};

// Server Component - busca os dados
export default async function MinhasReservasPage() {
  const result = await listarMinhasReservas();

  return <MinhasReservasClient initialReservas={result.reservas || []} />;
}
