import { test, expect } from '@playwright/test'
import { authStatePath } from '../../utils/auth'

/**
 * Payload mínimo para o endpoint de cadastro simples de obra.
 *
 * Regras de negócio do MVP:
 * - O cadastro simples exige apenas `name`.
 * - A empresa é inferida automaticamente pelo usuário autenticado.
 * - Endereço, responsável, contrato e dados técnicos são opcionais.
 * - A obra é criada com status INCOMPLETE / isComplete = false.
 */
function minimalWorksitePayload() {
  const suffix = Date.now()
  return { name: `Obra API Mínima ${suffix}` }
}

test.use({ storageState: authStatePath('admin') })

test.describe('API — Obras', () => {
  test('@api @smoke cria obra via API com payload mínimo (cadastro simples)', async ({ request }) => {
    const data = minimalWorksitePayload()

    const response = await request.post('/api/worksites', { data })

    // Debug: loga o body completo se o status não for o esperado
    if (response.status() !== 201) {
      const body = await response.json().catch(() => response.text())
      console.error('[debug] POST /api/worksites status:', response.status())
      console.error('[debug] response body:', JSON.stringify(body, null, 2))
    }

    expect(response.status()).toBe(201)

    const body = await response.json()
    // A obra deve ser criada com id, name e marcada como incompleta
    expect(body.data).toMatchObject({ name: data.name })
    expect(body.data.id).toBeTruthy()
    // Aceita qualquer convenção que o backend use para "incompleto"
    const isIncomplete =
      body.data.isComplete === false ||
      body.data.status === 'INCOMPLETE' ||
      body.data.isComplete === null
    expect(isIncomplete, 'A obra criada via cadastro simples deve estar marcada como incompleta').toBe(true)
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

    // A API usa Zod + handleError -> erros de validação retornam 422, não 400.
    expect(response.status()).toBe(422)
    const body = await response.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  test('@api @regression bloqueia payload sem campos obrigatórios (422)', async ({ request }) => {
    const response = await request.post('/api/worksites', { data: {} })

    expect(response.status()).toBe(422)
    const body = await response.json()
    expect(Array.isArray(body.error.details)).toBe(true)
    expect(body.error.details.length).toBeGreaterThan(0)
  })

  test('@api @regression lista obras da própria empresa', async ({ request }) => {
    const response = await request.get('/api/worksites')

    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body.data.data)).toBe(true)
    expect(body.data.meta).toHaveProperty('total')
  })
})

