import { test, expect } from '@playwright/test'

import { authStatePath } from '../../utils/auth'

/**
 * Payload mínimo válido para criação de obra via API.
 *
 * Contrato atual da API:
 * - name é obrigatório
 * - status é obrigatório
 * - registrationMode SIMPLE mantém a obra como cadastro incompleto
 * - groupId é opcional na API
 * - endereço, responsável, contrato e dados técnicos são opcionais no modo simples
 */
function minimalWorksitePayload() {
  const suffix = Date.now()

  return {
    name: `Obra API Mínima ${suffix}`,
    status: 'PLANEJAMENTO',
    registrationMode: 'SIMPLE',
  }
}

test.use({ storageState: authStatePath('admin') })

test.describe('API — Obras', () => {
  test('@api @smoke cria obra via API com payload mínimo válido', async ({ request }) => {
    const data = minimalWorksitePayload()

    const response = await request.post('/api/worksites', { data })

    if (response.status() !== 201) {
      const body = await response.json().catch(() => response.text())

      console.error('[debug] POST /api/worksites status:', response.status())
      console.error('[debug] response body:', JSON.stringify(body, null, 2))
    }

    expect(response.status()).toBe(201)

    const body = await response.json()

    expect(body.data).toMatchObject({
      name: data.name,
      status: 'PLANEJAMENTO',
      registrationMode: 'SIMPLE',
      isProfileComplete: false,
    })

    expect(body.data.id).toBeTruthy()
  })

  test('@api @regression bloqueia previsão de conclusão anterior à data de início (422)', async ({ request }) => {
    const today = new Date()
    const past = new Date(today)

    past.setDate(today.getDate() - 10)

    const data = {
      ...minimalWorksitePayload(),
      startDate: today.toISOString(),
      endDateForecast: past.toISOString(),
    }

    const response = await request.post('/api/worksites', { data })

    expect(response.status()).toBe(422)

    const body = await response.json()

    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(JSON.stringify(body.error.details)).toContain('endDateForecast')
  })

  test('@api @regression bloqueia payload sem campos obrigatórios (422)', async ({ request }) => {
    const response = await request.post('/api/worksites', { data: {} })

    expect(response.status()).toBe(422)

    const body = await response.json()

    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(Array.isArray(body.error.details)).toBe(true)
    expect(body.error.details.length).toBeGreaterThan(0)

    const details = JSON.stringify(body.error.details)

    expect(details).toContain('name')
    expect(details).toContain('status')
  })

  test('@api @regression lista obras da própria empresa', async ({ request }) => {
    const response = await request.get('/api/worksites')

    expect(response.status()).toBe(200)

    const body = await response.json()

    expect(Array.isArray(body.data.data)).toBe(true)
    expect(body.data.meta).toHaveProperty('total')
  })
})