import { redirect } from "next/navigation";

export default function DashboardHome() {
  // Redireciona para a tela de reserva
  redirect("/reserva");
}
