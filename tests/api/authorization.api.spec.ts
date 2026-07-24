import {
  test,
  expect,
  type APIRequestContext,
} from '@playwright/test'
import { authStatePath } from '../../utils/auth'
import {
  generateMinimalWorksite,
  type WorksiteData,
} from '../../fixtures/worksites'

type NormalizedWorksitePayload = Omit<
  WorksiteData,
  'startDate'
> & {
  startDate?: string
}

interface WorksiteSummary {
  id: string
  name: string
  status: string
  registrationMode: string
  isProfileComplete: boolean
}

interface WorksiteListResponse {
  data: {
    data: WorksiteSummary[]
    meta: {
      total: number
      page: number
      perPage: number
      totalPages: number
    }
  }
}

interface ApiErrorResponse {
  error: {
    code: string
    message: string
  }
}

const seedWorksites = {
  aurora: 'Edifício Aurora — Torre A',
  bosqueVerde: 'Residencial Bosque Verde',
  reformaCentro: 'Reforma Comercial Centro',
} as const

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

async function expectWorksiteCreationForbidden(
  request: APIRequestContext,
): Promise<void> {
  const worksite = generateMinimalWorksite()

  const response = await request.post('/api/worksites', {
    data: normalizeWorksitePayload(worksite),
  })

  expect(response.status()).toBe(403)

  const body =
    (await response.json()) as ApiErrorResponse

  expect(body.error).toMatchObject({
    code: 'FORBIDDEN',
  })

  expect(body.error.message).toMatch(
    /permissão|administrador|acesso/i,
  )
}

async function listAccessibleWorksiteNames(
  request: APIRequestContext,
): Promise<string[]> {
  const response = await request.get(
    '/api/worksites?perPage=100',
  )

  expect(response.status()).toBe(200)

  const body =
    (await response.json()) as WorksiteListResponse

  expect(body.data).toHaveProperty('data')
  expect(body.data).toHaveProperty('meta')
  expect(Array.isArray(body.data.data)).toBe(true)

  expect(body.data.meta.page).toBe(1)
  expect(body.data.meta.total).toBeGreaterThanOrEqual(
    body.data.data.length,
  )

  return body.data.data
    .map((worksite) => worksite.name)
    .sort()
}

test.describe('API — Autorização por perfil', () => {
  test.describe('COLABORADOR', () => {
    test.use({
      storageState: authStatePath('colaborador'),
    })

    test(
      '@api @regression COLABORADOR não pode criar obra (403)',
      async ({ request }) => {
        await expectWorksiteCreationForbidden(request)
      },
    )

    test(
      '@api @regression COLABORADOR recebe somente obras associadas',
      async ({ request }) => {
        const names =
          await listAccessibleWorksiteNames(request)

        expect(names).toEqual([
          seedWorksites.aurora,
        ])

        expect(names).not.toContain(
          seedWorksites.bosqueVerde,
        )

        expect(names).not.toContain(
          seedWorksites.reformaCentro,
        )
      },
    )
  })

  test.describe('CLIENTE_SINDICO', () => {
    test.use({
      storageState: authStatePath('cliente'),
    })

    test(
      '@api @regression CLIENTE_SINDICO não pode criar obra (403)',
      async ({ request }) => {
        await expectWorksiteCreationForbidden(request)
      },
    )

    test(
      '@api @regression CLIENTE_SINDICO recebe somente obras associadas',
      async ({ request }) => {
        const names =
          await listAccessibleWorksiteNames(request)

        expect(names).toEqual([
          seedWorksites.aurora,
        ])

        expect(names).not.toContain(
          seedWorksites.bosqueVerde,
        )

        expect(names).not.toContain(
          seedWorksites.reformaCentro,
        )
      },
    )
  })

  test.describe('GESTOR_OBRA', () => {
    test.use({
      storageState: authStatePath('gestor'),
    })

    test(
      '@api @regression GESTOR_OBRA não pode criar obra (403)',
      async ({ request }) => {
        await expectWorksiteCreationForbidden(request)
      },
    )

    test(
      '@api @regression GESTOR_OBRA recebe somente obras associadas',
      async ({ request }) => {
        const names =
          await listAccessibleWorksiteNames(request)

        expect(names).toEqual(
          [
            seedWorksites.aurora,
            seedWorksites.reformaCentro,
          ].sort(),
        )

        expect(names).not.toContain(
          seedWorksites.bosqueVerde,
        )
      },
    )
  })

  /**
   * Este cenário exige uma segunda empresa real no seed.
   *
   * Não deve ser ativado usando apenas duas obras da mesma empresa,
   * porque isso validaria associação, não isolamento multitenant.
   */
  test.skip(
    '@api @regression usuário não acessa obra de outra empresa — requer segundo tenant',
    async () => {
      /*
       * Implementação necessária na aplicação:
       *
       * 1. Criar Company B no seed;
       * 2. Criar usuário da Company B;
       * 3. Criar obra da Company B com ID fixo;
       * 4. Autenticar como ADMIN_EMPRESA da Company A;
       * 5. Consultar a obra da Company B;
       * 6. Esperar 404 para não revelar a existência do recurso.
       */
    },
  )
})