# Nota técnica — motion SGS Segurança

Snapshot de partida: `sgs-marketing-current-sanitized-2026-11-07.zip`, SHA256 `25e612c522da1d0bf74dcbba6a06ab48760c69c00b9c4d59e478edc138dcec9e`. Conteúdo, seções, WhatsApp e `noindex` conferidos com a prévia https://sgs-seguranca-preview.pages.dev antes das mudanças. Esta entrega não publica deploy.

## Rotas

O site é de uma página. Rotas reais: `/` e `/404`. Não foram criadas páginas vazias para simular transição de rota. O que existe no lugar:

- âncoras do menu (`#produto`, `#modulos`, `#jornada`, `#sophie`, `#seguranca`, `#faq`) com foco no destino e `scroll-margin` do header;
- no desktop com ponteiro fino, o Lenis leva a âncora em cerca de 0,85 s e só então move o foco. Links externos, inclusive o WhatsApp, não são interceptados;
- item atual do menu (`aria-current="location"`);
- um fio de 2 px sob o header quando a seção em vista muda. Some sozinho. Não existe em `prefers-reduced-motion`.

## Referências e o que entrou no código

Tradução própria para um produto de SST. Nada de cursor de agência, reveal em todo card, WebGL, Rive, áudio ou scroll hijack.

1. **Jam Area** (GSAP + Lenis, timelines e continuidade de navegação). Usado na sequência do hero (checklist do celular acende e o painel acompanha), na troca das abas de módulos e no foco das âncoras. Lenis só com mouse fino, tela larga e sem redução de movimento.
2. **Mindmarket** (traço SVG de 0 a 1 com o progresso do scroll). O fio da jornada liga os números 01–04 e um ponto percorre o traço. Nomes reais: Registra no campo, Assina e aprova, Vira evidência, Aparece nos indicadores.
3. **Working Stiff** (ritmo de blocos, DOM/SVG, hierarquia). Máscara tipográfica no H1 e nos H2, respiro da jornada e passagem entre seções. Sem estética de produtora.
4. **Zajno**. Sem cena que obrigue espera: o preloader não cobre a página, não há pin e a jornada não reserva scroll vazio. A altura de cada etapa é o próprio texto mais a tela ilustrativa.
5. **Manet** (evidência só de título/tags; o mecanismo não foi afirmado). Proposta autoral aplicada: no desktop a tela da etapa fica sticky e troca com o scroll; no mobile cada etapa é um card vertical, sem sticky, sem scrub e sem parallax.

## Efeitos implementados

- Hero: máscara das duas linhas do título; sequência em loop do checklist para o painel (status, barras, 80%→92%); fio SVG com um ponto entre o celular e a lista. A ilustração é `aria-hidden` e tem a legenda “exemplo de interface, não um resultado de cliente”. Os números do painel continuam ilustrativos.
- Jornada: fio desenhado pelo scroll no desktop; painel sticky que mostra o mock da etapa ativa; no mobile, card + mock sempre visíveis, ativados por `IntersectionObserver`.
- Módulos: indicador deslizante já existente e entrada curta das linhas ao trocar de aba (teclado incluso).
- Frase “Menos planilha. Mais evidência.”: as palavras passam de `#3d556c` para `#0d3457`. Nunca ficam apagadas abaixo do contraste de texto.
- Sophie: digitação curta ao entrar na seção; com redução de movimento o texto completo aparece de uma vez. O HTML já traz o texto.
- Escudo, checks e wordmark do rodapé: desenho único ao entrar.
- Marquee, chips e malha que duram mais de 5 s pausam num controle real, não só no hover. O controle é a caixa `#pausar-movimento`, com nome “Pausar movimento” / “Retomar movimento”. Fica no início da ordem de tabulação, depois do skip link. Espaço no teclado e toque no rótulo alternam. O CSS (`:has`) para o marquee, os chips e as malhas mesmo sem o script do hero. O loop do hero e a digitação da Sophie, que são GSAP, pausam no mesmo `change` e não retomam enquanto a caixa estiver marcada; o hero também continua pausando fora da tela e com a aba oculta. Fora da vista, o marquee recebe `is-offscreen` e para. Em `prefers-reduced-motion` o controle some, porque essas animações nem começam.
- Cursor customizado removido da página. Botões de WhatsApp têm um deslocamento magnético muito curto, que não atrasa o clique.

## Contraste da linha da jornada

A frase “Role para ver o caminho que o registro faz dentro do SGS.” não passava por um fade. Em todo frame medido, inclusive nos 1,2 s depois de chegar na seção, a cor computada era `rgb(61, 85, 108)` (`--ink-muted`) com opacidade 1. Sobre `#0d3457` isso dá contraste 1,65:1. A regra `.section-head p` vinha depois de `.section-dark p` e empatava em especificidade, então o azul escuro de fundo claro vencia no fundo escuro. A correção é só `.section-dark .section-head p { color: #e8f1fa }`. Depois disso a cor computada é `rgb(232, 241, 250)`, contraste 11,18:1, no estado normal e com redução de movimento.

## Header no fim da página

Suspeita do vídeo `jornada.mp4` por volta de 00:09–00:10, reproduzida no Chromium em 1280×800, no fim do scroll, na volta e com foco em “Produto”. O header é `position: sticky`, não pin. Parado no rodapé: fundo `rgb(252, 254, 255)`, texto do menu `rgb(15, 36, 56)`, contraste 15,61:1, foco com outline de 3 px. O fundo branco não some sobre o azul do rodapé. As formas brancas que passam por baixo do header nesse trecho são os botões “Abrir WhatsApp” e “Já sou cliente” rolando sob o sticky. O wordmark, com a entrada concluída, encosta no próprio bloco (topo e base iguais aos do pai); o corte visto no meio do vídeo é o `translateY` da entrada, com `overflow: hidden`, não o estado final. Nenhuma regra do header foi alterada.

## Reduced motion e sem JS

`prefers-reduced-motion` e a classe `reduce-motion`: sem Lenis, sem scrub, sem sticky de jornada, sem fio animado de passagem, sem máscaras. Título, quatro etapas, quatro mocks, frase e menu ficam estáticos e completos. Sem JS o preloader não existe na tela, os reveals não escondem texto e os painéis de módulos aparecem empilhados.

## Fatos preservados

- Marca, azul `#1D5B8D`, copy aprovada, seções e FAQ.
- WhatsApp exato: `https://wa.me/553186937268?text=Olá!%20Quero%20conhecer%20o%20SGS%20Segurança.` O número local segue com 8 dígitos, como informado.
- Planos sob consulta. Sem preços, clientes, certificações, depoimentos ou métricas de impacto novos.
- Login continua em `https://app.sgsseguranca.com.br/login`. Nenhum código do app foi alterado.
- `noindex` por padrão, CSP com hash dos inline, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. Sem segredo e sem dependência nova.

## Arquivos principais

- `src/scripts/motion.ts` — timelines, fio, âncoras, abas, Lenis condicional.
- `src/components/Journey.astro`, `Hero.astro`, `Header.astro`, `layouts/BaseLayout.astro`.
- `src/styles/global.css` — bloco “fio da evidência” no final.
- `src/config.ts` e `src/data/content.ts` — não mudaram de conteúdo.
- `astro.config.mjs` — headers e noindex iguais ao snapshot.

## Comandos e o que foi medido

Tudo abaixo é laboratório local (127.0.0.1), sem rede de produção e sem CrUX. Não é nota de campo.

Build: `npm run build` concluiu. Saída `dist/` com `_headers` (CSP com hash do script inline, HSTS, nosniff, frame deny, `X-Robots-Tag: noindex, nofollow`), `robots.txt` com `Disallow: /` e `404.html`. Não há `_redirects`: as únicas rotas são `/` e `404.html`, que o Cloudflare Pages já serve. Um fallback `/* /index.html 200` esconderia o 404.

`node scripts/serve-headers.mjs 4331` e `QA_BASE=http://127.0.0.1:4331/ node scripts/qa-motion.mjs`: sem erro. Fio do hero com comprimento, fio da jornada mudou o `stroke-dashoffset` no scroll (etapa ativa chegou em “Aparece nos indicadores”), zero pin, Lenis só no desktop, sem cursor artificial, preloader `hidden`, WhatsApp exato, âncora `#faq` recebe foco, Escape fecha o menu, quatro mocks visíveis no mobile, reduced-motion sem Lenis e com texto completo, sem JS o H1 e as quatro etapas aparecem. Axe wcag2a/aa no desktop: nenhuma violação. Sem overflow em 1440, 390 e 360.

`node scripts/qa-prod.mjs`: Chromium 20/20 seções sem overflow (1440, 1280, 768, 390, 360) e sem erro de console/CSP. Axe 1440 e 390: nenhuma violação. 404 responde 404, `noindex`, H1 “Página não encontrada.”, axe limpo. Teclado: primeiro foco no skip link, menu abre e o Escape fecha, seta troca a aba para Gestão e só esse painel fica visível, FAQ abre, foco `3px`. Cursor nativo. Reduced-motion sem Lenis e sem cursor custom. Sem JS, preloader `display: none` e nenhum reveal escondido, no 1440 e no 390. JS bloqueado: conteúdo utilizável em 57 ms depois do critério do script. No 3G simulado o documento (CSS bloqueante no head) levou cerca de 5,0 s até o preloader existir no DOM; ele já nasce oculto pelo style inline, não é um overlay. WhatsApp `https://wa.me/553186937268?text=Olá! Quero conhecer o SGS Segurança.` status 200. Login do app status 200. Firefox e WebKit não estavam instalados neste ambiente, então esses dois browsers do script não rodaram.

Lighthouse 13 local, headless, uma passagem cada:

- Desktop (`--preset=desktop`): performance 1.00, accessibility 1.00, LCP 321 ms, CLS 0.00002, TBT 0 ms.
- Mobile (emulação do Lighthouse): performance 1.00, accessibility 1.00, LCP 1201 ms, CLS 0, TBT 11 ms.

É localhost sem latência real. Não usar esses números como promessa da prévia pública. O Lighthouse acima é do pacote anterior; a v2 não foi medida de novo.

Na v2, no dev server, o checkbox “Pausar movimento” recebeu foco por Tab. Espaço marcou a caixa, o hero ficou em `data-hero-hold=1` e o KPI não mudou por 0,9 s; Espaço de novo desmarcou e o hero voltou a `hold=0`. Com o marquee na tela, o estado foi `running` → `paused` → `running`. No toque em 390×844 a mesma caixa pausou marquee e hero, sem overflow (390 e 360). Com `prefers-reduced-motion`, o controle fica `display: none`, o marquee tem `animation-name: none`, não há Lenis e a linha da jornada permanece em `#e8f1fa`. Sem erro de página.

## Riscos reais

- O fio do hero é recalculado no resize. Um zoom extremo pode deixar o traço encostado no mock; o texto do hero não depende dele.
- Lenis no desktop altera a sensação do scroll. Não está no mobile, no touch nem com redução de movimento. Quem usa só teclado no desktop com mouse fino ainda recebe Lenis na roda; as âncoras continuam levando o foco ao alvo.
- A jornada desktop ocupa cerca de 46vh por etapa para a troca do mock. É conteúdo, não um pin, mas é mais longa que quatro cards curtos.
- Axe pode seguir apontando contraste em texto decorativo se o marquee voltar a usar preenchimento transparente.
- O loop do hero continua e recomeça. Quem não quer o movimento usa “Pausar movimento” (teclado ou toque). A legenda segue dizendo que o painel é exemplo.
- Revisão v2, sem deploy. Publicar só o zip `sgs-marketing-dist-cloudflare-v2.zip`. O pacote anterior não tem o contraste da jornada nem o controle de pausa.
