import { test, expect } from '@playwright/test'

/**
 * Estes cenários validam requisições realmente anônimas.
 *
 * O projeto "api" usa por padrão a sessão do administrador.
 * Por isso, este arquivo precisa sobrescrever o storageState
 * com um estado vazio.
 */
test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
})

test.describe('API — Autenticação', () => {
  test(
    '@api @regression bloqueia acesso a rota protegida sem sessão',
    async ({ request }) => {
      const response = await request.get('/api/worksites')
      const body = await response.json()

      expect(
        response.status(),
        `Resposta recebida: ${JSON.stringify(body, null, 2)}`,
      ).toBe(401)

      expect(body).toMatchObject({
        error: {
          code: 'UNAUTHORIZED',
        },
      })

      expect(body.error.message).toMatch(
        /não autenticado|autenticação|sessão/i,
      )
    },
  )

  test(
    '@api @regression bloqueia criação de obra sem sessão',
    async ({ request }) => {
      const response = await request.post('/api/worksites', {
        data: {
          name: 'Obra sem sessão',
          registrationMode: 'SIMPLE',
          status: 'PLANEJAMENTO',
        },
      })

      const body = await response.json()

      expect(
        response.status(),
        `Resposta recebida: ${JSON.stringify(body, null, 2)}`,
      ).toBe(401)

      expect(body).toMatchObject({
        error: {
          code: 'UNAUTHORIZED',
        },
      })
    },
  )

  test(
    '@api @regression rota pública de health check responde sem autenticação',
    async ({ request }) => {
      const response = await request.get('/api/health')
      const body = await response.json()

      expect(
        response.status(),
        `Resposta recebida: ${JSON.stringify(body, null, 2)}`,
      ).toBe(200)

      expect(body).toMatchObject({
        status: 'healthy',
      })

      expect(body.timestamp).toEqual(expect.any(String))
      expect(body.version).toEqual(expect.any(String))
    },
  )
})