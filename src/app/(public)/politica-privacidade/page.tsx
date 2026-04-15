export default function PoliticaPrivacidadePage() {
  const atualizacao = "13 de abril de 2026";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Última atualização: {atualizacao}
      </p>

      <div className="mt-8 space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            1. Introdução
          </h2>
          <p className="mt-2">
            O sistema de reserva de espaços é uma aplicação web para
            gerenciamento de reservas de espaços integrada ao Google Calendar.
            Esta política descreve como coletamos, usamos e protegemos seus
            dados pessoais.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            2. Dados Coletados
          </h2>
          <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
            2.1 Autenticação (Google OAuth)
          </h3>
          <p className="mt-2">
            Ao fazer login com sua conta Google, coletamos apenas os dados
            necessários para identificação:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Foto de perfil (opcional)</li>
            <li>Identificador único do Google (ID)</li>
          </ul>

          <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
            2.2 Dados do Formulário de Reserva
          </h3>
          <p className="mt-2">
            Ao criar uma reserva, coletamos:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Título da programação</li>
            <li>Nome do responsável</li>
            <li>Telefone de contato</li>
            <li>Observações (opcionais)</li>
            <li>Data e horário da reserva</li>
            <li>Espaços selecionados</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            3. Escopos Google OAuth Solicitados
          </h2>
          <p className="mt-2">
            Nosso login utiliza apenas os seguintes escopos do Google:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                openid
              </code>{" "}
              — Autenticação OpenID Connect
            </li>
            <li>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                userinfo.email
              </code>{" "}
              — E-mail do usuário
            </li>
            <li>
              <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                userinfo.profile
              </code>{" "}
              — Nome e foto
            </li>
          </ul>

          <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Nota importante:</strong> As operações com Google Calendar
              são realizadas via <strong>Service Account</strong> no servidor da
              aplicação. O login do usuário <strong>não</strong> solicita
              permissão de acesso ao Calendar. O usuário autentica-se apenas
              para identificação (nome, e-mail, foto).
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            4. Finalidade do Tratamento
          </h2>
          <p className="mt-2">
            Utilizamos seus dados para:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Identificar você no sistema de reservas</li>
            <li>Criar e gerenciar reservas de espaços no Google Calendar</li>
            <li>Exibir suas reservas na seção &quot;Minhas Reservas&quot;</li>
            <li>
              Disponibilizar informações de contato (responsável e telefone)
              para diáconos e equipe de cozinha
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            5. Armazenamento dos Dados
          </h2>
          <p className="mt-2">
            <strong>Não possuímos banco de dados próprio.</strong> Todos os
            dados de reserva são armazenados no <strong>Google Calendar</strong>
            da igreja (tenant). Informações de sessão são gerenciadas pelo
            NextAuth.js via cookies seguros.
          </p>
          <p className="mt-2">
            O Google Calendar é acessado exclusivamente via Service Account no
            servidor — não acessamos o Calendar pessoal do usuário.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            6. Compartilhamento de Dados
          </h2>
          <p className="mt-2">
            Seus dados podem ser compartilhados com:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Google Cloud Platform</strong> — como infraestrutura de
              armazenamento (Google Calendar via Service Account)
            </li>
            <li>
              <strong>Equipe interna da igreja</strong> — diáconos e equipe de
              cozinha podem visualizar nome do responsável e telefone no
              descritivo do evento
            </li>
          </ul>
          <p className="mt-2">
            <strong>Não vendemos, alugamos ou compartilhamos seus dados</strong>{" "}
            com terceiros para fins de marketing ou publicidade.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            7. Segurança
          </h2>
          <p className="mt-2">
            Adotamos as seguintes medidas de segurança:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              Conexões criptografadas via HTTPS em toda a aplicação
            </li>
            <li>
              Autenticação segura via NextAuth.js com OAuth 2.0 do Google
            </li>
            <li>
              Tokens de sessão armazenados em cookies seguros (httpOnly)
            </li>
            <li>
              Service Account do Google Calendar protegida no servidor —
              credenciais nunca expostas no cliente
            </li>
            <li>
              Validação de dados de entrada com Zod no servidor
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            8. Seus Direitos (LGPD)
          </h2>
          <p className="mt-2">
            De acordo com a Lei Geral de Proteção de Dados (LGPD — Lei nº
            13.709/2018), você tem direito a:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>Acesso</strong> — solicitar cópia dos dados que temos
              sobre você
            </li>
            <li>
              <strong>Retificação</strong> — corrigir dados incompletos,
              inexatos ou desatualizados
            </li>
            <li>
              <strong>Exclusão</strong> — solicitar a eliminação dos seus dados
              pessoais (exceto quando o armazenamento for obrigatório por lei)
            </li>
            <li>
              <strong>Portabilidade</strong> — transferir seus dados para outro
              fornecedor de serviço
            </li>
            <li>
              <strong>Revogação do consentimento</strong> — retirar seu
              consentimento para o tratamento de dados a qualquer momento
            </li>
          </ul>
          <p className="mt-2">
            Para exercer seus direitos, entre em contato conosco pelo e-mail
            informado na seção &quot;Contato&quot;.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            9. Cookies
          </h2>
          <p className="mt-2">
            Utilizamos cookies de sessão gerenciados pelo NextAuth.js. Estes
            cookies são:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>
              <strong>httpOnly</strong> — não acessíveis via JavaScript no
              navegador
            </li>
            <li>
              <strong>Secure</strong> — transmitidos apenas por conexões HTTPS
            </li>
            <li>
              <strong>Temporários</strong> — expiram quando a sessão termina ou
              após período de inatividade
            </li>
          </ul>
          <p className="mt-2">
            Não utilizamos cookies de rastreamento, analytics ou publicidade.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            10. Contato
          </h2>
          <p className="mt-2">
            Para dúvidas, solicitações ou exercício de seus direitos previstos
            na LGPD, entre em contato:
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
            11. Atualizações desta Política
          </h2>
          <p className="mt-2">
            Esta política pode ser atualizada periodicamente. Notificaremos
            sobre mudanças significativas através de aviso na própria aplicação
            ou por e-mail. Recomendamos revisar esta página regularmente.
          </p>
        </section>
      </div>
    </div>
  );
}
