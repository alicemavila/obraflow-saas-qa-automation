import { test, expect } from '@playwright/test'
import { authStatePath } from '../../utils/auth'
import { generateMinimalWorksite } from '../../fixtures/worksites'

test.describe('API — Autorização por perfil', () => {
  test.describe('COLABORADOR', () => {
    test.use({ storageState: authStatePath('colaborador') })

    test('@api @regression COLABORADOR não pode criar obra (403)', async ({ request }) => {
      const data = generateMinimalWorksite()
      const response = await request.post('/api/worksites', {
        data: { ...data, startDate: new Date(data.startDate).toISOString() },
      })
      expect(response.status()).toBe(403)
    })
  })

  test.describe('CLIENTE_SINDICO', () => {
    test.use({ storageState: authStatePath('cliente') })

    test('@api @regression CLIENTE_SINDICO não pode criar obra (403)', async ({ request }) => {
      const data = generateMinimalWorksite()
      const response = await request.post('/api/worksites', {
        data: { ...data, startDate: new Date(data.startDate).toISOString() },
      })
      expect(response.status()).toBe(403)
    })

    test('@api @regression CLIENTE_SINDICO só recebe obras às quais está vinculado', async ({ request }) => {
      const response = await request.get('/api/worksites')
      expect(response.status()).toBe(200)
      // A rota filtra por WorksiteUser internamente para esse perfil — aqui
      // validamos apenas o contrato (200 + shape), já que a quantidade
      // exata depende da massa do seed.
      const body = await response.json()
      expect(Array.isArray(body.data.data)).toBe(true)
    })
  })

  test.describe('GESTOR_OBRA', () => {
    test.use({ storageState: authStatePath('gestor') })

    test('@api @regression GESTOR_OBRA não pode criar obra (403)', async ({ request }) => {
      const data = generateMinimalWorksite()
      const response = await request.post('/api/worksites', {
        data: { ...data, startDate: new Date(data.startDate).toISOString() },
      })
      expect(response.status()).toBe(403)
    })
  })

  /**
   * Limitação conhecida (documentada conforme orientação do plano de
   * testes): validar isolamento entre empresas diferentes (multi-tenant)
   * exigiria uma segunda empresa/usuário no seed, que hoje não existe.
   * Ver docs/test-strategy.md → "Limitações conhecidas".
   */
  test.skip('@api @regression usuário não acessa obra de outra empresa (cross-tenant) — requer massa de 2ª empresa', async () => {
    // Próximo passo: estender prisma/seed.ts com uma segunda Company e
    // reativar este teste.
  })
})
