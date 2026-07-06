# ObraFlow SaaS — QA Automation

Suíte de automação de testes E2E e API para o [ObraFlow](https://github.com/alicemavila/obraflow-saas), um SaaS de gestão de obras e diário de obra (RDO), construída com **Playwright + TypeScript** e **Page Object Model**.

> Projeto de portfólio em QA Automation — foco em fluxos críticos de um SaaS multiempresa com RBAC (5 perfis de usuário), não em cobertura exaustiva.

## Stack

- [Playwright](https://playwright.dev/) (E2E multi-browser + testes de API)
- TypeScript
- Page Object Model
- `dotenv` para configuração de ambiente
- GitHub Actions (CI)

## Escopo dos testes

| Módulo | Cobertura |
|---|---|
| Autenticação | Login válido/inválido, validação de campos, logout, bloqueio de rota protegida |
| Obras | Cadastro (obrigatórios + opcionais), validação de datas, RBAC por perfil |
| Usuários | Convite de usuário, validação, bloqueio por perfil |
| Diário de obra | Criação em duas etapas (cabeçalho + atividades), submissão, validação de diário vazio |
| Portal Cliente | Documentado com `test.fixme` — **feature ainda não implementada no app** |
| API | Contrato de resposta (status HTTP, shape), autorização por perfil (401/403/422) |

### ⚠️ Nota importante sobre o escopo

Este projeto foi construído a partir do **código real** do ObraFlow, não de uma especificação hipotética. Por isso alguns cenários foram **adaptados** em relação a specs genéricas de SaaS de gestão de obras:

- Não existe alternância "cadastro simples vs. completo" — é um único formulário com campos obrigatórios e opcionais.
- Não existem "grupos" de obras nem badge de "cadastro incompleto".
- Usuários são **convidados** por e-mail (nome + e-mail + perfil) — o admin não define senha.
- O **Portal Cliente/Síndico não está implementado** — o middleware já redireciona `CLIENTE_SINDICO` para `/client`, mas a página não existe. Os testes correspondentes usam `test.fixme` (ver `docs/test-plan.md` e `docs/risk-matrix.md`).

## Estratégia de testes

Ver `docs/test-strategy.md` para a estratégia completa (pirâmide, priorização P0/P1/P2, decisão de arquitetura para autenticação de API). Resumo:

- `@smoke`: caminho feliz dos fluxos críticos (login, criar obra, criar diário)
- `@regression`: validações de negócio, RBAC, mensagens de erro
- `@api`: contrato de resposta e autorização via API

## Como instalar

Pré-requisitos: Node.js 20+, e o **ObraFlow rodando localmente** (`http://localhost:3000` por padrão — ver o README do [repositório do app](https://github.com/alicemavila/obraflow-saas)).

```bash
git clone https://github.com/alicemavila/obraflow-saas-qa-automation.git
cd obraflow-saas-qa-automation
npm install
npx playwright install --with-deps
```

## Como configurar o `.env`

```bash
cp .env.example .env
```

Preencha com as credenciais da massa demo do seed do ObraFlow (já vêm certas no `.env.example`, só confirme que batem com o que o seed do app gerou). **Nunca commite o `.env`** — ele já está no `.gitignore`.

## Como rodar os testes

```bash
# Gera as sessões salvas (storageState) de cada perfil — roda uma vez, ou
# sempre que quiser sessões "frescas"
npx playwright test --project=setup

# Todos os testes
npm test

# Só smoke
npm run test:smoke

# Só regressão
npm run test:regression

# Por módulo
npm run test:auth
npm run test:worksites
npm run test:api

# Modo interativo (ótimo para debugar)
npm run test:ui

# Com navegador visível
npm run test:headed
```

## Como abrir o relatório

```bash
npm run report
```

Abre o relatório HTML do Playwright — evidência de execução com passos, screenshots e traces de falhas.

## Como funciona o Page Object Model

Cada tela relevante tem uma classe em `pages/` que encapsula seletores e ações (ex: `LoginPage.login(email, password)`). Os specs em `tests/` orquestram essas ações e fazem as asserções — eles não conhecem seletores CSS/XPath diretamente. Isso mantém os testes legíveis e resilientes a mudanças de layout.

Prioridade de seletores usada: `getByRole` → `getByLabel` → `getByText` → `data-testid` (quando o texto é ambíguo, ex: múltiplos botões "Adicionar" na tela de diário) → CSS como último recurso.

## Como funciona o CI/CD

`.github/workflows/playwright.yml` roda a suíte a cada push/PR para `main`. As credenciais vêm de **GitHub Secrets** (nunca hardcoded no workflow). O relatório HTML e as evidências de falha (screenshots/vídeos/traces) são publicados como artefatos da execução.

> Hoje não existe um ambiente de staging publicado — o `BASE_URL` do CI está preparado para apontar para um ambiente remoto via **GitHub Actions Variables** assim que existir; enquanto isso, a suíte é validada rodando localmente.

## Evidências geradas

- Relatório HTML do Playwright (`playwright-report/`)
- Screenshot, vídeo e trace **apenas em testes que falharam** (`test-results/`)

## Boas práticas de segurança

- Nenhuma credencial real é versionada — tudo vem de `.env` (local) ou GitHub Secrets (CI)
- `.gitignore` protege `.env`, `.auth/` (sessões salvas), relatórios e `node_modules`
- Massa de dados sempre gerada dinamicamente com sufixos únicos (evita dados sensíveis fixos e colisão entre execuções)

## Próximos passos

- [ ] Ativar os testes do Portal Cliente (`test.fixme` → `test`) quando a feature for implementada no app
- [ ] Adicionar massa de uma 2ª empresa no seed do app para cobrir isolamento cross-tenant
- [ ] Cobrir fluxo de aprovação/rejeição de diário por GESTOR_OBRA/ADMIN_EMPRESA
- [ ] Cobrir upload de fotos/anexos assim que a UI for integrada
- [ ] Expandir `data-testid` no app para reduzir dependência de texto visível em telas com múltiplos elementos similares
- [ ] Configurar ambiente de staging e apontar o CI para ele

## Git — subindo este projeto

```bash
git init
git branch -M main
git add .
git status   # confirme que .env e .auth/ NÃO aparecem na lista
git commit -m "chore: setup inicial da automação QA do ObraFlow"
git remote add origin https://github.com/alicemavila/obraflow-saas-qa-automation.git
git push -u origin main
```
