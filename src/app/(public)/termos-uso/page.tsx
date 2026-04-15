export default function TermosUsoPage() {
  const atualizacao = "13 de abril de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Termos de Uso
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Última atualização: {atualizacao}
      </p>

      <div className="mt-8 space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            1. Aceitação dos Termos
          </h2>
          <p className="mt-2">
            Ao acessar e utilizar o Sistema de Reserva de Espaços da igreja,
            você concorda integralmente com estes Termos de Uso. Se não
            concordar com alguma parte, não utilize o sistema.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            2. Elegibilidade
          </h2>
          <p className="mt-2">
            Para utilizar o sistema, você deve:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Ser membro ou colaborador autorizado da igreja
            </li>
            <li>
              Ter conta Google válida para autenticação
            </li>
            <li>
              Ser maior de idade ou ter autorização de responsável legal
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            3. Regras de Reserva
          </h2>

          <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
            3.1 Criação de Reservas
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Horário final deve ser maior que horário inicial
            </li>
            <li>
              Não são permitidas reservas em datas anteriores ao dia atual
            </li>
            <li>
              Duração mínima de 30 minutos por reserva
            </li>
            <li>
              Janela de reserva: Seg-Qui → próxima semana; Sex-Dom → semana subsequente
            </li>
          </ul>

          <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
            3.2 Conflitos
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              O sistema verifica disponibilidade automaticamente
            </li>
            <li>
              Conflito em qualquer espaço/data aborta <strong>TODA</strong> a reserva (nenhuma reserva parcial é criada)
            </li>
            <li>
              Para reservas recorrentes, conflitos em qualquer data abortam todas as ocorrências
            </li>
          </ul>

          <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
            3.3 Cancelamento
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              O usuário pode cancelar suas próprias reservas pela seção &quot;Minhas Reservas&quot;
            </li>
            <li>
              Cancelamentos devem ser feitos com antecedência mínima de 24 horas
            </li>
            <li>
              Cancelamentos tardios devem ser comunicados diretamente à administração
            </li>
          </ul>

          <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
            3.4 Recorrência
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Reservas recorrentes criam eventos individuais no Google Calendar (não recorrência nativa)
            </li>
            <li>
              Tipo de recorrência: semanal ou mensal
            </li>
            <li>
              Data de término é obrigatória para reservas recorrentes
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            4. Uso dos Espaços
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              O responsável pela reserva é responsável pelo uso adequado do espaço
            </li>
            <li>
              Manter limpeza e organização do espaço utilizado
            </li>
            <li>
              Comunicar quaisquer danos à administração imediatamente
            </li>
            <li>
              Devolver o espaço nas condições em que foi encontrado
            </li>
            <li>
              Respeitar horários definidos na reserva
            </li>
            <li>
              Não alterar a configuração do espaço sem autorização
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            5. Conteúdo dos Eventos
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Os eventos realizados devem estar em conformidade com os valores e doutrina da igreja
            </li>
            <li>
              A igreja reserva-se o direito de recusar ou cancelar reservas cujo conteúdo não esteja em conformidade
            </li>
            <li>
              Informações de contato (responsável e telefone) ficam visíveis no descritivo do evento para diáconos e equipe de cozinha
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            6. Propriedade Intelectual
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              O sistema de reservas é de uso interno da igreja
            </li>
            <li>
              Dados armazenados no Google Calendar são propriedade da igreja
            </li>
            <li>
              É proibido copiar, reproduzir ou distribuir dados do sistema sem autorização
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            7. Limitação de Responsabilidade
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              O sistema é fornecido &quot;no estado em que se encontra&quot; (as-is)
            </li>
            <li>
              A igreja não garante disponibilidade ininterrupta do sistema
            </li>
            <li>
              A igreja não se responsabiliza por falhas na integração com Google Calendar
            </li>
            <li>
              O usuário é responsável pela precisão das informações fornecidas nas reservas
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            8. Disponibilidade do Sistema
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              O sistema pode ficar indisponível para manutenções programadas
            </li>
            <li>
              Interrupções não programadas podem ocorrer por causas técnicas ou de infraestrutura
            </li>
            <li>
              A igreja se compromete a comunicar interrupções significativas com antecedência quando possível
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            9. Modificações nos Termos
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Estes termos podem ser atualizados periodicamente
            </li>
            <li>
              Notificaremos sobre mudanças significativas através de aviso na aplicação ou por e-mail
            </li>
            <li>
              O uso continuado do sistema após modificações constitui aceitação dos novos termos
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            10. Rescisão do Acesso
          </h2>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              O acesso ao sistema pode ser revogado em caso de violação destes termos
            </li>
            <li>
              Decisões de rescisão são de responsabilidade da administração da igreja
            </li>
            <li>
              O usuário pode deixar de usar o sistema a qualquer momento
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            11. Contato
          </h2>
          <p className="mt-2">
            Para dúvidas sobre estes termos, entre em contato:
          </p>
          <p className="mt-2">
            <strong>E-mail:</strong>{" "}
            <span className="italic text-gray-500">
              [e-mail da igreja]
            </span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            12. Lei Aplicável
          </h2>
          <p className="mt-2">
            Estes termos são regidos pelas leis da República Federativa do
            Brasil. O foro da comarca da igreja será competente para resolução
            de quaisquer disputas decorrentes do uso do sistema.
          </p>
        </section>
      </div>
    </div>
  );
}
