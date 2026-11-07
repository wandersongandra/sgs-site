/**
 * Dados confirmados do produto SGS. Não inventar clientes, preços ou CNPJ.
 */

export const site = {
  name: 'SGS Segurança',
  shortName: 'SGS',
  title: 'SGS Segurança | Gestão de Segurança do Trabalho',
  description:
    'Sistema para gestão de Segurança e Saúde do Trabalho: análise de risco, permissão de trabalho, checklists, documentos, treinamentos, exames e indicadores — com uso em campo e Sophie IA.',
  locale: 'pt-BR',
  url: 'https://sgsseguranca.com.br',
  appLoginUrl: 'https://app.sgsseguranca.com.br/login',
  supportEmail: 'suporte@sgsseguranca.com.br',
  /** E.164 sem +. Número informado pelo responsável. */
  whatsapp: '553186937268',
  whatsappDisplay: '(31) 8693-7268',
  whatsappIsPlaceholder: false,
  whatsappDefaultMessage: 'Olá! Quero conhecer o SGS Segurança.',
  plansLabel: 'Planos sob consulta',
} as const;

export function whatsappUrl(message = site.whatsappDefaultMessage): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${site.whatsapp}?text=${text}`;
}
