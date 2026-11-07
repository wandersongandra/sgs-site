/** Conteúdo derivado apenas do repositório sgsseguranca / app em produção. */

export const audiences = [
  {
    title: 'Gestores',
    text: 'Acompanhe conformidade e pendências em um painel único, sem chasing de planilha.',
  },
  {
    title: 'Técnicos de segurança',
    text: 'Registre APR, PT, checklists e evidências no celular, com apoio mesmo sem internet nos módulos preparados.',
  },
  {
    title: 'Administradores',
    text: 'Organize empresas, unidades, usuários e permissões com isolamento entre clientes.',
  },
  {
    title: 'Auditores',
    text: 'Consulte histórico, documentos versionados e verificação de autenticidade.',
  },
  {
    title: 'Equipes operacionais',
    text: 'Participe do diálogo diário, do início do dia e das pendências da obra ou planta.',
  },
] as const;

export const moduleGroups = [
  {
    id: 'campo',
    title: 'Campo e operação',
    lead: 'O que acontece na frente de trabalho, com aprovação e evidências.',
    mockLabel: 'Rotina de campo',
    items: [
      {
        name: 'APR',
        full: 'Análise Preliminar de Risco',
        desc: 'Itens, evidências e fluxo de aprovação antes da atividade.',
        icon: 'shield',
      },
      {
        name: 'PT',
        full: 'Permissão de Trabalho',
        desc: 'Altura, confinado, quente, eletricidade e escavação.',
        icon: 'permit',
      },
      {
        name: 'ARR',
        full: 'Avaliação e Registro de Risco',
        desc: 'Registro de risco no fluxo operacional.',
        icon: 'alert',
      },
      {
        name: 'DDS',
        full: 'Diálogo Diário de Segurança',
        desc: 'Publicação e rastreio do diálogo do turno.',
        icon: 'chat',
      },
      {
        name: 'DID',
        full: 'Diário de Início do Dia',
        desc: 'Alinhamento operacional antes da jornada.',
        icon: 'sunrise',
      },
      {
        name: 'Checklists',
        full: 'Checklists',
        desc: 'Modelos e execuções com não conformidades e ações.',
        icon: 'check',
      },
    ],
  },
  {
    id: 'gestao',
    title: 'Gestão e conformidade',
    lead: 'Quando algo foge do padrão, o ciclo fecha com responsável e prazo.',
    mockLabel: 'Tratativas',
    items: [
      {
        name: 'Não conformidades',
        full: 'Não conformidades',
        desc: 'Registro, acompanhamento e vínculo com inspeções.',
        icon: 'flag',
      },
      {
        name: 'Auditorias',
        full: 'Auditorias',
        desc: 'Planejamento e execução com evidências.',
        icon: 'search',
      },
      {
        name: 'Ações corretivas',
        full: 'Ações corretivas',
        desc: 'Responsável, prazo e status até o fechamento.',
        icon: 'wrench',
      },
      {
        name: 'CAT',
        full: 'Comunicação de Acidente de Trabalho',
        desc: 'Registro de CAT no fluxo de segurança do trabalho.',
        icon: 'med',
      },
    ],
  },
  {
    id: 'saude',
    title: 'Saúde ocupacional',
    lead: 'Obrigações de pessoas com vencimentos sob controle.',
    mockLabel: 'Pessoas',
    items: [
      {
        name: 'Treinamentos',
        full: 'Treinamentos',
        desc: 'Obrigações, vencimentos e certificados.',
        icon: 'book',
      },
      {
        name: 'Exames médicos',
        full: 'Exames médicos',
        desc: 'Controle de exames e prazos ocupacionais.',
        icon: 'heart',
      },
      {
        name: 'EPI',
        full: 'Equipamento de Proteção Individual',
        desc: 'Catálogo, fichas e atribuições.',
        icon: 'hardhat',
      },
      {
        name: 'Calendário',
        full: 'Calendário de segurança',
        desc: 'Agenda de eventos e compromissos.',
        icon: 'cal',
      },
    ],
  },
  {
    id: 'docs',
    title: 'Controle de documentos',
    lead: 'PDFs com versionamento, assinatura e verificação pública.',
    mockLabel: 'Documentos',
    items: [
      {
        name: 'Acervo',
        full: 'Acervo documental',
        desc: 'Documentos com rastreabilidade e pendências.',
        icon: 'folder',
      },
      {
        name: 'Assinaturas',
        full: 'Assinaturas',
        desc: 'Fluxo de assinatura de documentos.',
        icon: 'pen',
      },
      {
        name: 'Verificação',
        full: 'Verificação pública',
        desc: 'Página para validar autenticidade do documento.',
        icon: 'badge',
      },
      {
        name: 'Importação',
        full: 'Importação',
        desc: 'Entrada assistida, inclusive com apoio de IA.',
        icon: 'upload',
      },
    ],
  },
  {
    id: 'relatorios',
    title: 'Relatórios e indicadores',
    lead: 'Do registro na obra ao painel de quem decide.',
    mockLabel: 'Indicadores',
    items: [
      {
        name: 'Relatórios',
        full: 'Central de relatórios',
        desc: 'Saídas operacionais consolidadas.',
        icon: 'report',
      },
      {
        name: 'Fotos',
        full: 'Relatório fotográfico',
        desc: 'Evidências visuais organizadas por contexto.',
        icon: 'camera',
      },
      {
        name: 'RDO',
        full: 'Relatório Diário de Obra',
        desc: 'Registro diário no fluxo de segurança.',
        icon: 'clipboard',
      },
      {
        name: 'Indicadores',
        full: 'Indicadores',
        desc: 'Visão executiva de conformidade.',
        icon: 'chart',
      },
    ],
  },
] as const;

export const offlineCaps = [
  {
    name: 'APR, PT, checklists e não conformidades',
    status: 'Dá para ler e registrar sem internet; sincroniza depois.',
  },
  {
    name: 'ARR, início do dia e unidades',
    status: 'Consulta do que já estiver no aparelho.',
  },
  {
    name: 'DDS, RDO, treinamentos e exames',
    status: 'Precisam de conexão com o servidor.',
  },
] as const;

export const journeySteps = [
  {
    n: '01',
    title: 'Registra no campo',
    text: 'O técnico preenche checklist, APR ou PT no celular, com foto e observação.',
  },
  {
    n: '02',
    title: 'Assina e aprova',
    text: 'O fluxo de aprovação e assinatura deixa claro quem validou e quando.',
  },
  {
    n: '03',
    title: 'Vira evidência',
    text: 'O registro entra no acervo, no relatório ou na tratativa, pronto para auditoria.',
  },
  {
    n: '04',
    title: 'Aparece nos indicadores',
    text: 'Gestores veem pendências e conformidade sem montar planilha na mão.',
  },
] as const;

export const sophieTasks = [
  'Análise de APR e PT',
  'Sugestão de DDS',
  'Leitura de checklists',
  'Insights da operação',
  'Apoio a relatório fotográfico',
  'Chat com dados do sistema',
] as const;

export const sophieChat = [
  { role: 'user', text: 'Quais APRs de altura estão pendentes de aprovação?' },
  {
    role: 'sophie',
    text: 'Encontrei 3 APRs de trabalho em altura aguardando aprovação. Quer que eu resuma os riscos mais citados?',
  },
  { role: 'user', text: 'Sim, e sugira um DDS curto para o turno da tarde.' },
  {
    role: 'sophie',
    text: 'Riscos mais citados: queda, ancoragem e clima. Preparei um rascunho de DDS focado nesses três pontos.',
  },
] as const;

export const securityPoints = [
  {
    title: 'Cada cliente no seu espaço',
    text: 'Consultas, arquivos e relatórios ficam isolados entre empresas. O banco reforça esse limite.',
  },
  {
    title: 'LGPD no dia a dia',
    text: 'Dados pessoais só o necessário. Informações de saúde com acesso restrito.',
  },
  {
    title: 'Acesso protegido',
    text: 'Login com verificação em duas etapas, sessões rastreáveis e permissões por função.',
  },
  {
    title: 'Trilha de auditoria',
    text: 'Ações importantes ficam registradas para apuração e conformidade.',
  },
] as const;

export const faqs = [
  {
    q: 'O SGS é um aplicativo de celular?',
    a: 'É um sistema web que funciona bem no celular. Técnicos usam o modo campo no navegador, com uso offline nos módulos preparados. Não há app nativo separado neste produto.',
  },
  {
    q: 'Dá para trabalhar sem internet?',
    a: 'Sim, na APR, na PT, nos checklists e nas não conformidades: dá para ler e registrar sem conexão e sincronizar depois. Outros módulos só consultam o que já estiver no aparelho ou pedem internet.',
  },
  {
    q: 'O que é a Sophie?',
    a: 'Sophie é a assistência de IA do SGS. Ela ajuda a analisar APR e PT, sugerir DDS, ler checklists e conversar com dados da sua empresa, com controle de acesso e cuidado com informações sensíveis.',
  },
  {
    q: 'Como funciona a verificação de documentos?',
    a: 'Documentos do sistema podem ser conferidos em páginas públicas de verificação, para validar autenticidade sem abrir o restante da operação.',
  },
  {
    q: 'Quais planos e preços existem?',
    a: 'Os planos são sob consulta. Fale conosco no WhatsApp para entender o cenário da sua operação.',
  },
  {
    q: 'Onde acesso o sistema?',
    a: 'Em app.sgsseguranca.com.br. Este site apresenta o produto; o login fica no endereço do aplicativo.',
  },
] as const;

export const valuePoints = [
  {
    title: 'Campo e escritório no mesmo fluxo',
    text: 'Do checklist na obra ao PDF assinado e ao indicador no painel, sem retrabalho.',
  },
  {
    title: 'Conformidade com evidência',
    text: 'Aprovações, anexos, fotos e histórico sustentam a decisão e a fiscalização.',
  },
  {
    title: 'Várias empresas, cada uma isolada',
    text: 'Pensado para operar clientes e unidades com permissões claras e escala.',
  },
] as const;
