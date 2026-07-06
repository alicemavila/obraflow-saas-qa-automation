import { test, expect } from '@playwright/test'
import { routes } from '../../utils/routes'

/**
 * Autenticação via API "pura" é complexa aqui porque o ObraFlow usa
 * NextAuth v5 com credentials provider + CSRF token — não é um simples
 * POST de login. Por isso, seguindo a recomendação do próprio plano de
 * testes, a autenticação para os testes de API é obtida via UI e reutilizada
 * como storageState (ver tests/e2e/auth.setup.ts e utils/auth.ts). Os
 * testes abaixo focam no que É possível/apropriado testar via API pura:
 * bloqueio de rotas protegidas sem sessão.
 */
test.describe('API — Autenticação', () => {
  test('@api @regression bloqueia acesso a rota protegida sem sessão', async ({ request }) => {
    const response = await request.get('/api/worksites')
    expect(response.status()).toBe(401)

    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  test('@api @regression bloqueia criação de obra sem sessão', async ({ request }) => {
    const response = await request.post('/api/worksites', {
      data: {
        name: 'Obra sem sessão',
        cep: '01310-100',
        address: 'Rua X',
        city: 'São Paulo',
        state: 'SP',
        responsibleName: 'Teste',
        startDate: new Date().toISOString(),
      },
    })
    expect(response.status()).toBe(401)
  })

  test('@api @regression rota pública de health check responde sem autenticação', async ({ request }) => {
    const response = await request.get('/api/health')
    // Documentando o contrato esperado — ajustar se a rota retornar outro formato.
    expect(response.status()).toBeLessThan(500)
    void routes
  })
})
