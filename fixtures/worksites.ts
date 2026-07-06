import { uniqueSuffix, todayISO, futureDateISO, randomCep } from '../utils/test-data'

/**
 * O formulário de obra do ObraFlow é único (não existe alternância entre
 * "cadastro simples" e "cadastro completo" na UI atual). Os campos abaixo
 * refletem o schema real (src/lib/validations/worksite.ts):
 *
 * Obrigatórios: name, cep, address, city, state, responsibleName, startDate
 * Opcionais: neighborhood, clientName, contractNumber, responsibleCrea,
 *            artNumber, totalArea, endDateForecast, description
 */
export interface WorksiteData {
  name: string
  clientName?: string
  contractNumber?: string
  cep: string
  address: string
  neighborhood?: string
  city: string
  state: string
  responsibleName: string
  responsibleCrea?: string
  artNumber?: string
  totalArea?: string
  startDate: string
  endDateForecast?: string
  description?: string
}

/** Somente os campos obrigatórios preenchidos. */
export function generateMinimalWorksite(): WorksiteData {
  const suffix = uniqueSuffix()
  return {
    name: `Obra Automação Mínima ${suffix}`,
    cep: '01310-100',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    responsibleName: `Eng. Teste ${suffix}`,
    startDate: todayISO(),
  }
}

/** Todos os campos (obrigatórios + opcionais) preenchidos. */
export function generateCompleteWorksite(): WorksiteData {
  const suffix = uniqueSuffix()
  return {
    name: `Obra Automação Completa ${suffix}`,
    clientName: `Condomínio Teste ${suffix}`,
    contractNumber: `CT-QA-${suffix}`,
    cep: randomCep(),
    address: 'Rua das Automações, 123',
    neighborhood: 'Centro',
    city: 'Recife',
    state: 'PE',
    responsibleName: `Eng. QA ${suffix}`,
    responsibleCrea: `CREA-PE ${suffix}`,
    artNumber: `PE-ART-${suffix}`,
    totalArea: '450.75',
    startDate: todayISO(),
    endDateForecast: futureDateISO(180),
    description: 'Obra criada automaticamente pela suíte de testes E2E.',
  }
}

/** Data de término anterior à de início — usado para validar a regra de negócio. */
export function generateWorksiteWithInvalidDateRange(): WorksiteData {
  const base = generateMinimalWorksite()
  return {
    ...base,
    startDate: futureDateISO(30),
    endDateForecast: futureDateISO(5),
  }
}
