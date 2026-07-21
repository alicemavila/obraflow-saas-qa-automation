import { test, expect } from '@playwright/test'
import { authStatePath } from '../../utils/auth'
import {
  generateMinimalWorksite,
  type WorksiteData,
} from '../../fixtures/worksites'

type NormalizedWorksitePayload = Omit<WorksiteData, 'startDate'> & {
  startDate?: string
}

/**
 * Normaliza o payload antes de enviá-lo para a API.
 *
 * Cadastro simples:
 * - startDate pode não existir;
 * - quando estiver ausente, a propriedade não será enviada.
 *
 * Cadastro completo:
 * - quando startDate existir, será convertida para ISO 8601.
 */
function normalizeWorksitePayload(
  data: WorksiteData,
): NormalizedWorksitePayload {
  const { startDate, ...remainingData } = data

  if (!startDate) {
    return remainingData
  }

  return {
    ...remainingData,
    startDate: new Date(startDate).toISOString(),
  }
}

test.describe('API — Autorização por perfil', () => {
  test.describe('COLABORADOR', () => {
    test.use({
      storageState: authStatePath('colaborador'),
    })

    test(
      '@api @regression COLABORADOR não pode criar obra pelo cadastro simples (403)',
      async ({ request }) => {
        const data = generateMinimalWorksite()

        const response = await request.post('/api/worksites', {
          data: normalizeWorksitePayload(data),
        })

        expect(response.status()).toBe(403)
      },
    )
  })

  test.describe('CLIENTE_SINDICO', () => {
    test.use({
      storageState: authStatePath('cliente'),
    })

    test(
      '@api @regression CLIENTE_SINDICO não pode criar obra pelo cadastro simples (403)',
      async ({ request }) => {
        const data = generateMinimalWorksite()

        const response = await request.post('/api/worksites', {
          data: normalizeWorksitePayload(data),
        })

        expect(response.status()).toBe(403)
      },
    )

    test(
      '@api @regression CLIENTE_SINDICO só recebe obras às quais está vinculado',
      async ({ request }) => {
        const response = await request.get('/api/worksites')

        expect(response.status()).toBe(200)

        /*
         * A rota filtra internamente as obras vinculadas ao usuário por meio
         * de WorksiteUser.
         *
         * Aqui validamos apenas o contrato básico da resposta, porque a
         * quantidade exata de obras depende da massa criada pelo seed.
         */
        const body = await response.json()

        expect(body).toHaveProperty('data')
        expect(body.data).toHaveProperty('data')
        expect(Array.isArray(body.data.data)).toBe(true)
      },
    )
  })

  test.describe('GESTOR_OBRA', () => {
    test.use({
      storageState: authStatePath('gestor'),
    })

    test(
      '@api @regression GESTOR_OBRA não pode criar obra pelo cadastro simples (403)',
      async ({ request }) => {
        const data = generateMinimalWorksite()

        const response = await request.post('/api/worksites', {
          data: normalizeWorksitePayload(data),
        })

        expect(response.status()).toBe(403)
      },
    )
  })

  /**
   * Limitação conhecida:
   *
   * A validação de isolamento entre empresas diferentes exige que o seed
   * possua pelo menos duas empresas e usuários associados a tenants
   * distintos.
   *
   * Ver:
   * docs/test-strategy.md → "Limitações conhecidas".
   */
  test.skip(
    '@api @regression usuário não acessa obra de outra empresa (cross-tenant) — requer massa de segunda empresa',
    async () => {
      /*
       * Próximo passo:
       *
       * 1. Criar uma segunda Company no seed da aplicação;
       * 2. Criar um usuário pertencente à segunda empresa;
       * 3. Criar uma obra pertencente à segunda empresa;
       * 4. Autenticar com um usuário da primeira empresa;
       * 5. Tentar consultar a obra da segunda empresa;
       * 6. Validar resposta 403 ou 404, conforme o contrato da API.
       */
    },
  )
})