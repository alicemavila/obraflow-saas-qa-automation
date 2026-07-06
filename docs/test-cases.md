# Casos de Teste — ObraFlow SaaS

Formato: ID | Funcionalidade | Prioridade | Tipo | Pré-condição | Passos | Resultado esperado | Automação

| ID | Funcionalidade | Prioridade | Tipo | Pré-condição | Passos | Resultado esperado | Status de automação |
|---|---|---|---|---|---|---|---|
| TC-001 | Login | P0 | E2E | Usuário ADMIN_EMPRESA existente | Acessar /login → preencher e-mail/senha válidos → Entrar | Redireciona para /dashboard | ✅ Automatizado (`login.spec.ts`) |
| TC-002 | Login | P1 | E2E | — | Preencher credenciais inválidas → Entrar | Mensagem "E-mail ou senha incorretos" | ✅ Automatizado |
| TC-003 | Login | P1 | E2E | — | Clicar Entrar sem preencher nada | Mensagens de campo obrigatório | ✅ Automatizado |
| TC-004 | Logout | P1 | E2E | Usuário logado | Abrir menu → Sair | Volta para /login; rota protegida bloqueada | ✅ Automatizado |
| TC-005 | Cadastro de obra | P0 | E2E | Logado como ADMIN_EMPRESA | Obras → Nova obra → preencher obrigatórios → Criar obra | Obra aparece na listagem com status "Planejamento" | ✅ Automatizado (`worksite-simple-registration.spec.ts`) |
| TC-006 | Cadastro de obra | P1 | E2E | Logado como ADMIN_EMPRESA | Nova obra → enviar em branco | Mensagens de validação por campo | ✅ Automatizado |
| TC-007 | Cadastro de obra | P1 | E2E | Logado como ADMIN_EMPRESA | Preencher todos os campos, incluindo opcionais → Criar obra | Obra criada com todos os dados persistidos | ✅ Automatizado (`worksite-complete-registration.spec.ts`) |
| TC-008 | Cadastro de obra | P1 | E2E | Logado como ADMIN_EMPRESA | Data de início posterior à previsão de conclusão | Bloqueia com mensagem de validação | ✅ Automatizado |
| TC-009 | RBAC — Obras | P0 | E2E/API | Logado como COLABORADOR | Acessar /obras | Botão "Nova obra" não aparece; POST direto retorna 403 | ✅ Automatizado (`worksite-permissions.spec.ts`) |
| TC-010 | RBAC — Obras | P0 | E2E | Logado como CLIENTE_SINDICO | Acessar qualquer rota fora de /client | Redirecionado para /client | ✅ Automatizado (comportamento do middleware) |
| TC-011 | RBAC — Obras | P1 | E2E | Logado como GESTOR_OBRA | Acessar /obras | Vê apenas obras associadas; sem botão de criação | ✅ Automatizado (parcial) |
| TC-012 | Usuários | P1 | E2E | Logado como ADMIN_EMPRESA | Usuários → Convidar usuário → preencher nome/e-mail/perfil → Enviar convite | Usuário aparece na listagem | ✅ Automatizado (`users-management.spec.ts`) |
| TC-013 | Usuários | P2 | E2E | Logado como ADMIN_EMPRESA | Convidar usuário sem preencher nada | Mensagem "Preencha todos os campos." | ✅ Automatizado |
| TC-014 | Usuários | P0 | E2E | Logado como CLIENTE_SINDICO / COLABORADOR | Acessar /admin/usuarios | Redirecionado (não vê a tela) | ✅ Automatizado |
| TC-015 | Diário de obra | P0 | E2E | Obra em andamento existente | Obra → Novo diário → data → Criar diário e continuar → adicionar atividade | Diário criado, atividade listada | ✅ Automatizado (`daily-log.spec.ts`) |
| TC-016 | Diário de obra | P1 | E2E | Diário em rascunho, sem atividades/mão de obra | Enviar para aprovação | Bloqueado com mensagem de diário vazio | ✅ Automatizado |
| TC-017 | Diário de obra | P2 | E2E | Obra em andamento | Novo diário sem preencher data | Não avança (campo obrigatório do navegador) | ✅ Automatizado |
| TC-018 | Portal Cliente | P0 | E2E | Logado como CLIENTE_SINDICO | Login → aguardar redirecionamento | Portal carrega com obras do cliente | ⏳ `test.fixme` — feature não implementada |
| TC-019 | Portal Cliente | P1 | E2E | Logado como CLIENTE_SINDICO | Verificar menu | Menu administrativo (Usuários, Empresa) não aparece | ⏳ `test.fixme` — feature não implementada |
| TC-020 | API — Obras | P0 | API | Sessão de ADMIN_EMPRESA (storageState) | POST /api/worksites com dados válidos | 201 + payload com `status: PLANEJAMENTO` | ✅ Automatizado (`worksites.api.spec.ts`) |
| TC-021 | API — Obras | P1 | API | Sessão de ADMIN_EMPRESA | POST /api/worksites com datas invertidas | 422 + `error.code = VALIDATION_ERROR` | ✅ Automatizado |
| TC-022 | API — Autorização | P0 | API | Sessão de COLABORADOR/CLIENTE/GESTOR | POST /api/worksites | 403 para todos os três perfis | ✅ Automatizado (`authorization.api.spec.ts`) |
| TC-023 | API — Autenticação | P0 | API | Sem sessão | GET/POST /api/worksites | 401 | ✅ Automatizado (`auth.api.spec.ts`) |
| TC-024 | API — Multiempresa | P1 | API | 2 empresas distintas no seed | Usuário da empresa A tenta acessar obra da empresa B | 404 (não deve nem confirmar existência) | ⏸️ `test.skip` — requer massa de 2ª empresa |
