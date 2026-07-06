# Plano de Testes — ObraFlow SaaS

## Objetivo
Validar os fluxos críticos do MVP do ObraFlow (autenticação, gestão de obras,
diário de obra/RDO, usuários e RBAC multiempresa) através de automação E2E
e de API, garantindo confiança para evolução contínua do produto.

## Escopo
- Autenticação (login, logout, validação de campos, credenciais inválidas)
- Cadastro de obras (campos obrigatórios e opcionais, validação de datas)
- RBAC: permissões por perfil (SUPER_ADMIN, ADMIN_EMPRESA, GESTOR_OBRA,
  COLABORADOR, CLIENTE_SINDICO)
- Gestão de usuários (convite, validação, bloqueio por perfil)
- Diário de obra (criação em duas etapas, atividades, submissão)
- API: contrato de resposta (status HTTP, shape do payload), autorização

## Fora de escopo (nesta fase)
- Portal Cliente/Síndico — feature não implementada no app alvo (gap
  documentado; testes preparados via `test.fixme`, ver `docs/risk-matrix.md`)
- Upload de fotos/anexos no diário — API existe, UI ainda não integrada
- Área `/admin/empresa`, `/admin/plano`, `/admin/perfil` — não implementadas
- Testes de carga/performance
- Testes de acessibilidade automatizados (fica como próximo passo)
- Isolamento cross-tenant completo — requer massa de uma 2ª empresa no seed

## Ambientes
| Ambiente | BASE_URL | Observação |
|---|---|---|
| Local | `http://localhost:3000` | Padrão atual — requer `docker compose up -d` + `npm run dev` no repo do app |
| Staging | a definir | CI já preparado para usar via `vars.BASE_URL`, mas ainda não existe ambiente publicado |

## Tipos de teste
- **E2E (Playwright + navegador real)**: fluxos de usuário ponta a ponta,
  Page Object Model, 3 engines (Chromium, Firefox, WebKit)
- **API (Playwright request context)**: contrato de resposta e regras de
  autorização, usando sessão obtida via `storageState`

## Critérios de entrada
- Ambiente alvo no ar e acessível via `BASE_URL`
- Massa demo do seed do ObraFlow presente (`npx prisma db seed` no repo do app)
- `.env` da automação preenchido a partir de `.env.example`

## Critérios de saída
- 100% dos testes marcados `@smoke` passando
- Testes `@regression` passando ou com causa raiz identificada/documentada
- Nenhum teste `@smoke`/`@regression` "flaky" sem investigação
- Relatório HTML gerado e anexado como evidência

## Riscos
Ver `docs/risk-matrix.md` para o detalhamento por área funcional.

## Estratégia de regressão
- `@smoke`: roda a cada push/PR (rápido, cobre o caminho feliz dos fluxos
  críticos)
- `@regression`: roda a cada push/PR também nesta fase inicial (suíte ainda
  pequena); conforme a suíte crescer, passa a rodar em pipeline agendada
  (nightly) ou sob demanda

## Evidências
- Relatório HTML do Playwright (`playwright-report/`), publicado como
  artefato do GitHub Actions a cada execução
- Screenshot, vídeo e trace **somente em falhas** (`test-results/`)

## Responsabilidades
- Autoria e manutenção da suíte: QA Automation (Alice Mavila)
- Correções de bugs identificados: time de desenvolvimento do ObraFlow
- Revisão de novos cenários ao entrar uma feature: QA + Dev em conjunto
