# Estratégia de Testes — ObraFlow SaaS

## Pirâmide de testes (visão do projeto de automação)
```
        ▲
       / \        E2E (Playwright) — poucos, focados nos fluxos críticos
      /___\
     /     \      API (Playwright request) — mais numerosos, rápidos
    /_______\
   /         \    Unitários/Integração — responsabilidade do repo do app
  /___________\   (jest, ver obraflow-saas/src/__tests__)
```
Este repositório cobre as duas camadas de topo (E2E e API). Testes
unitários/integração vivem no repositório do aplicativo
(`alicemavila/obraflow-saas`), não aqui.

## Priorização (P0/P1/P2)
| Prioridade | Critério | Exemplos |
|---|---|---|
| P0 | Bloqueia o uso do produto se quebrar | Login, criação de obra, criação de diário |
| P1 | Degrada a experiência ou quebra uma regra de negócio importante | Validações de formulário, RBAC, convite de usuário |
| P2 | Impacto limitado ou contorno existe | Mensagens de erro específicas, edge cases de UI |

## Smoke vs. Regression
- **`@smoke`**: caminho feliz dos fluxos P0. Deve rodar em minutos e dar
  confiança de que "o sistema está de pé".
- **`@regression`**: validações de negócio, RBAC, mensagens de erro,
  edge cases. Mais lenta, mais abrangente.

## Dados de teste
- Toda massa é gerada dinamicamente (`fixtures/*.ts` + `utils/test-data.ts`)
  com timestamps/sufixos únicos — evita colisão entre execuções paralelas
  ou reexecuções.
- As únicas credenciais fixas são as do seed demo do ObraFlow
  (`prisma/seed.ts` no repo do app), vindas de variáveis de ambiente.

## Automação E2E
- Page Object Model, seletores priorizando `getByRole`/`getByLabel`
  (acessibilidade real do app) e `data-testid` quando o texto visível é
  ambíguo (ex: múltiplos botões "Adicionar" na tela de diário).
- 3 browsers (Chromium, Firefox, WebKit) via `projects` do
  `playwright.config.ts`.

## Automação de API
- **Decisão de arquitetura**: a autenticação da API não é feita via um
  endpoint REST simples — o ObraFlow usa NextAuth v5 (credentials provider
  + CSRF token), o que tornaria um POST de login "cru" complexo e frágil.
  Em vez disso, a sessão é obtida uma única vez via login por UI
  (`tests/e2e/auth.setup.ts`) e reaproveitada como `storageState` pelos
  testes de API (`test.use({ storageState: ... })`). Essa abordagem é
  reconhecida e documentada como prática comum para testar APIs
  protegidas por sessão de navegador.
- Os testes de API validam contrato (status HTTP, shape do payload) e
  regras de autorização (403 para perfis sem permissão, 401 sem sessão,
  422 para erros de validação Zod).

## Limitações conhecidas
1. **Portal Cliente/Síndico não implementado** — testes preparados com
   `test.fixme`, prontos para "destravar" quando a feature existir.
2. **Isolamento cross-tenant** não totalmente coberto — falta massa de uma
   segunda empresa no seed do app (`tests/api/authorization.api.spec.ts`
   tem o teste esqueleto com `test.skip`).
3. **Sem ambiente de staging publicado** — o CI está pronto para apontar
   para um `BASE_URL` remoto via GitHub Actions Variables, mas hoje roda
   contra `localhost` (exige runner self-hosted ou execução manual local
   até existir staging).
4. **Envio real de e-mail (convite, reset de senha)** depende do Resend
   estar configurado no app — os testes validam o comportamento da UI/API,
   não a entrega do e-mail.
