import { Metadata } from "next";
import { CalendarIframe } from "./_components/CalendarIframe";
import { getCurrentTenant } from "@/lib/tenant/config";

export const metadata: Metadata = {
  title: "Agenda Geral",
  description: "Visualize a agenda geral de espaços da igreja",
};

export default function AgendaGeralPage() {
  const tenant = getCurrentTenant();

  return (
    <div className="max-w-full">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Agenda Geral
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Visualize todos os eventos e reservas dos espaços da igreja
        </p>
      </div>

      {/* Informações do Tenant */}
      <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">
              Visualização da Agenda - {tenant.name}
            </p>
            <p className="mt-1">
              Este calendário mostra todos os eventos agendados nos espaços da
              igreja. Para fazer uma reserva, acesse a tela{" "}
              <a
                href="/reserva"
                className="font-medium text-blue-600 underline dark:text-blue-400"
              >
                Reservar Espaço
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Calendário Iframe */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-1 dark:border-gray-700 dark:bg-gray-dark dark:shadow-card">
        <CalendarIframe height="700px" />
      </div>

      {/* Instruções */}
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          Dica: Use os controles do Google Calendar para navegar entre meses,
          mudar a visualização (dia, semana, mês) e ver detalhes dos eventos.
        </p>
      </div>
    </div>
  );
}
