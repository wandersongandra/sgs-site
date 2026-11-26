/** Conteúdo derivado apenas do repositório sgsseguranca / app em produção. Sem números, clientes ou certificações inventados. */

export const audiences = [
  {
    title: 'Gestores',
    text: 'Pendências, vencimentos e conformidade no mesmo painel em que o campo registrou, sem montar planilha.',
  },
  {
    title: 'Técnicos de segurança',
    text: 'APR, PT, checklist e evidência no celular, inclusive offline nos módulos preparados.',
  },
  {
    title: 'Administradores',
    text: 'Empresas, unidades, usuários e permissões, com isolamento entre clientes.',
  },
  {
    title: 'Auditores',
    text: 'Histórico, documentos versionados e página pública de verificação de autenticidade.',
  },
  {
    title: 'Equipes operacionais',
    text: 'Diálogo diário, início do dia e pendências da obra ou da planta.',
  },
] as const;

export const moduleGroups = [
  {
    id: 'campo',
    title: 'Campo e operação',
    lead: 'O que acontece na frente de trabalho entra com evidência e segue para aprovação.',
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
        desc: 'Trabalho em altura, espaço confinado, trabalho a quente, eletricidade e escavação.',
        icon: 'permit',
      },
      {
        name: 'ARR',
        full: 'Avaliação e Registro de Risco',
        desc: 'Registro do risco encontrado na área.',
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
        desc: 'Alinhamento da equipe antes de começar o trabalho.',
        icon: 'sunrise',
      },
      {
        name: 'Checklists',
        full: 'Checklists',
        desc: 'Modelos e execuções, com não conformidade e ação quando o item foge do padrão.',
        icon: 'check',
      },
    ],
  },
  {
    id: 'gestao',
    title: 'Gestão e conformidade',
    lead: 'Não conformidade, auditoria, ação corretiva e CAT, com responsável e prazo.',
    mockLabel: 'Tratativas',
    items: [
      {
        name: 'Não conformidades',
        full: 'Não conformidades',
        desc: 'Registro, acompanhamento e vínculo com a inspeção que originou a NC.',
        icon: 'flag',
      },
      {
        name: 'Auditorias',
        full: 'Auditorias',
        desc: 'Planejamento e execução, com evidência do que foi apurado.',
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
        desc: 'Registro da CAT no histórico de SST.',
        icon: 'med',
      },
    ],
  },
  {
    id: 'saude',
    title: 'Saúde ocupacional',
    lead: 'Treinamento NR, exame, EPI e calendário, com controle de vencimento.',
    mockLabel: 'Pessoas',
    items: [
      {
        name: 'Treinamentos',
        full: 'Treinamentos',
        desc: 'Obrigações, vencimentos e certificados de cada colaborador.',
        icon: 'book',
      },
      {
        name: 'Exames médicos',
        full: 'Exames médicos',
        desc: 'Controle de exames e prazos ocupacionais, com acesso restrito.',
        icon: 'heart',
      },
      {
        name: 'EPI',
        full: 'Equipamento de Proteção Individual',
        desc: 'Catálogo, fichas e entregas por colaborador.',
        icon: 'hardhat',
      },
      {
        name: 'Calendário',
        full: 'Calendário de segurança',
        desc: 'Vencimentos e compromissos da operação.',
        icon: 'cal',
      },
    ],
  },
  {
    id: 'docs',
    title: 'Controle de documentos',
    lead: 'PDF com versão, assinatura e página pública de verificação.',
    mockLabel: 'Documentos',
    items: [
      {
        name: 'Acervo',
        full: 'Acervo documental',
        desc: 'Documentos versionados, com rastreabilidade e pendências de assinatura.',
        icon: 'folder',
      },
      {
        name: 'Assinaturas',
        full: 'Assinaturas',
        desc: 'Quem assinou, em que papel e quando.',
        icon: 'pen',
      },
      {
        name: 'Verificação',
        full: 'Verificação pública',
        desc: 'Página para validar a autenticidade do documento, sem abrir o resto da operação.',
        icon: 'badge',
      },
      {
        name: 'Importação',
        full: 'Importação',
        desc: 'Entrada assistida de arquivos existentes, com apoio da Sophie.',
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
        desc: 'Saídas da operação, reunidas para consulta.',
        icon: 'report',
      },
      {
        name: 'Fotos',
        full: 'Relatório fotográfico',
        desc: 'Evidências visuais agrupadas por atividade e data.',
        icon: 'camera',
      },
      {
        name: 'RDO',
        full: 'Relatório Diário de Obra',
        desc: 'Registro do dia na obra, no fluxo de SST.',
        icon: 'clipboard',
      },
      {
        name: 'Indicadores',
        full: 'Indicadores',
        desc: 'Pendências e vencimentos por unidade, no mesmo sistema.',
        icon: 'chart',
      },
    ],
  },
] as const;

export const offlineCaps = [
  {
    name: 'APR, PT, checklists e não conformidades',
    status: 'Dá para ler e registrar sem internet. Sincroniza quando a rede volta.',
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
    text: 'O técnico preenche APR, PT ou checklist no celular, com foto e observação no próprio item.',
  },
  {
    n: '02',
    title: 'Assina e aprova',
    text: 'A aprovação e a assinatura ficam no próprio registro. O rastro não depende de um papel que precisa voltar do campo.',
  },
  {
    n: '03',
    title: 'Vira evidência',
    text: 'O registro entra no acervo, no PDF com verificação ou na tratativa, pronto para a auditoria e a fiscalização.',
  },
  {
    n: '04',
    title: 'Aparece no painel',
    text: 'O gestor vê pendências, vencimentos e conformidade no mesmo sistema em que o campo registrou.',
  },
] as const;

export const sophieTasks = [
  'Análise de APR e PT',
  'Sugestão de DDS',
  'Leitura de checklists',
  'Apoio a relatório fotográfico',
  'Chat com dados do sistema',
] as const;

export const sophieChat = [
  { role: 'user', text: 'Quais APRs de altura estão pendentes de aprovação?' },
  {
    role: 'sophie',
    text: 'Há APRs de trabalho em altura aguardando aprovação. Quer que eu resuma os riscos mais citados?',
  },
  { role: 'user', text: 'Sim, e sugira um DDS curto para o turno da tarde.' },
  {
    role: 'sophie',
    text: 'Os riscos mais citados são queda, ancoragem e clima. Preparei um rascunho de DDS focado nesses pontos.',
  },
] as const;

export const securityPoints = [
  {
    title: 'Cada empresa no seu espaço',
    text: 'Consultas, arquivos e relatórios ficam isolados entre empresas. O banco reforça esse limite.',
  },
  {
    title: 'LGPD no dia a dia',
    text: 'Dados pessoais só o necessário. Informações de saúde ocupacional com acesso restrito.',
  },
  {
    title: 'Acesso por função',
    text: 'Login com verificação em duas etapas, sessões rastreáveis e permissões por perfil.',
  },
  {
    title: 'Trilha de auditoria',
    text: 'Ações importantes ficam registradas, com usuário e data, para apuração e conformidade.',
  },
] as const;

export const faqs = [
  {
    q: 'Precisa instalar aplicativo?',
    a: 'Não. O SGS roda no navegador, no computador ou no celular. No celular, o técnico usa o modo campo, inclusive offline nos módulos preparados.',
  },
  {
    q: 'Funciona sem internet?',
    a: 'Sim, na APR, na PT, nos checklists e nas não conformidades: dá para ler e registrar sem conexão e sincronizar depois. Outros módulos só consultam o que já estiver no aparelho ou pedem internet.',
  },
  {
    q: 'O que é a Sophie?',
    a: 'Sophie é a assistência de IA do SGS. Analisa APR e PT, sugere DDS, lê checklists e consulta dados da empresa, com controle de acesso. O que ela gera é rascunho para alguém revisar.',
  },
  {
    q: 'Como alguém confere se um PDF é verdadeiro?',
    a: 'Documentos do sistema podem ser conferidos em páginas públicas de verificação, para validar autenticidade sem abrir o restante da operação.',
  },
  {
    q: 'Quanto custa?',
    a: 'Os planos são sob consulta. Chame no WhatsApp e conte o tamanho da operação.',
  },
  {
    q: 'Onde fica o login?',
    a: 'Em app.sgsseguranca.com.br. Este site apresenta o produto; o login fica no endereço do aplicativo.',
  },
] as const;

export const valuePoints = [
  {
    title: 'Campo e escritório no mesmo fluxo',
    text: 'Do checklist na obra ao PDF assinado e ao indicador no painel, sem retrabalho e sem papel que se perde no caminho.',
  },
  {
    title: 'Evidência que aguenta fiscalização',
    text: 'Aprovação, anexo, foto e histórico ficam no próprio registro, prontos para auditoria e fiscalização.',
  },
  {
    title: 'Cada empresa isolada',
    text: 'Clientes e unidades operam com permissões por função. A consulta de um não aparece para o outro.',
  },
] as const;
