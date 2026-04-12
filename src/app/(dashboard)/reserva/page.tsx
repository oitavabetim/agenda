import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentTenant, getEspacosDoTenant } from "@/lib/tenant/config";
import { ReservaFormProvider } from "./_components/ReservaFormContext";
import { ReservaFormFrame } from "./_components/ReservaFormFrame";
import { ReservaFormProgramacao } from "./_components/ReservaFormProgramacao";
import { ReservaFormDataHorario } from "./_components/ReservaFormDataHorario";
import { ReservaFormRecorrencia } from "./_components/ReservaFormRecorrencia";
import { ReservaFormEspacos } from "./_components/ReservaFormEspacos";
import { ReservaFormMapa } from "./_components/ReservaFormMapa";
import { ReservaFormFooter } from "./_components/ReservaFormFooter";
import { RecorrenciaToggle } from "./_components/RecorrenciaToggle";

export const metadata: Metadata = {
  title: "Reservar Espaço",
  description: "Faça a reserva de espaços para sua programação",
};

export default async function ReservaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Obter tenant e espaços (síncrono, mas executamos em paralelo conceitual)
  const tenant = getCurrentTenant();
  const espacos = getEspacosDoTenant(tenant.id);

  // Vercel: server-serialization - passar apenas campos necessários
  // Nunca passar googleClientSecret ou campos sensíveis para client components
  const espacosSafe = espacos.map((e) => ({
    id: e.id,
    nome: e.nome,
    descricao: e.descricao,
    capacidade: e.capacidade,
  }));

  return (
    <div className="max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Reservar Espaço
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Preencha o formulário abaixo para reservar um ou mais espaços para
          sua programação
        </p>
      </div>

      <ReservaFormProvider
        usuarioNome={session.user.name || "Usuário"}
        usuarioEmail={session.user.email || ""}
        tenantId={tenant.id}
        mapaUrl={tenant.mapaUrl}
        espacosDisponiveis={espacosSafe}
      >
        <ReservaFormFrame>
          <ReservaFormProgramacao />
          <ReservaFormDataHorario />

          {/* Checkbox de recorrência */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
            <RecorrenciaToggle />
          </div>

          <ReservaFormRecorrencia />
          <ReservaFormMapa />
          <ReservaFormEspacos />
          <ReservaFormFooter />
        </ReservaFormFrame>
      </ReservaFormProvider>
    </div>
  );
}
