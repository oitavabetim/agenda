import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Minhas Reservas",
};

export default function MinhasReservasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
