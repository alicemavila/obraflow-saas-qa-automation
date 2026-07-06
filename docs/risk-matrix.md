# Matriz de Riscos — ObraFlow SaaS

Escala de risco = Probabilidade × Impacto (Baixo / Médio / Alto).

| Área | Risco | Probabilidade | Impacto | Risco | Mitigação (automação) |
|---|---|---|---|---|---|
| Login/Autenticação | Credenciais inválidas não bloqueadas corretamente | Baixa | Alto | Médio | `tests/e2e/auth/login.spec.ts` |
| Login/Autenticação | Sessão não expira / rota protegida acessível sem login | Baixa | Alto | Médio | `login.spec.ts` (logout + acesso direto) |
| RBAC/Permissões | Perfil sem permissão consegue criar/editar recursos | Média | Alto | **Alto** | `worksite-permissions.spec.ts`, `authorization.api.spec.ts` |
| RBAC/Permissões | Perfil vê dados de obra não autorizada | Média | Alto | **Alto** | `worksite-permissions.spec.ts` (parcial — ver limitações) |
| Isolamento multiempresa | Usuário de uma empresa acessa dado de outra | Baixa | Crítico | **Alto** | Não coberto ainda — `test.skip` documentado, requer massa de 2ª empresa |
| Cadastro de obras | Obra criada com dados inválidos (datas invertidas, campos vazios) | Média | Médio | Médio | `worksite-complete-registration.spec.ts` |
| Cadastro de obras | Limite de obras do plano não é respeitado | Baixa | Médio | Baixo | Não coberto ainda — próximo passo |
| Diário/RDO | Diário submetido sem conteúdo (vazio) | Média | Médio | Médio | `daily-log.spec.ts` |
| Diário/RDO | Diário aprovado/rejeitado incorretamente por perfil errado | Baixa | Alto | Médio | Não coberto ainda — próximo passo |
| Relatórios | PDF gerado com dados incorretos/incompletos | Baixa | Médio | Baixo | Não coberto — fora do escopo desta fase |
| Área cliente | Cliente acessa área administrativa | Baixa | Alto | Médio | `client-area.spec.ts` (comportamento atual do middleware) |
| Área cliente | Portal cliente não implementado (gap de produto) | Certa | Médio | Médio | `client-area.spec.ts` com `test.fixme`, ver `test-plan.md` |
| Uploads/anexos | Upload de arquivo malicioso/tipo não permitido | Baixa | Alto | Médio | Não coberto — UI ainda não integrada |
| LGPD/Segurança | Senha de usuário exposta em resposta de API | Baixa | Crítico | Médio | Validação manual recomendada (não automatizada ainda) |
| LGPD/Segurança | `.env`/segredos commitados no repositório | Baixa | Crítico | Médio | Fora do escopo de testes funcionais — mitigado por `.gitignore` + CI com secrets |

## Legenda de prioridade de automação
- Alto → cobertura obrigatória, já implementada ou próximo passo imediato
- Médio → cobertura recomendada, parte do roadmap de evolução
- Baixo → cobertura oportunista, não bloqueante
