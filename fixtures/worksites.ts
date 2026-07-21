import { futureDateISO, randomCep, todayISO, uniqueSuffix } from '../utils/test-data'

export type WorksiteStatus =
  | 'PLANEJAMENTO'
  | 'EM_ANDAMENTO'
  | 'PAUSADA'
  | 'CONCLUIDA'
  | 'CANCELADA'

export type WorksiteRegistrationMode = 'SIMPLE' | 'COMPLETE'

export interface WorksiteData {
  name: string
  status: WorksiteStatus
  registrationMode: WorksiteRegistrationMode
  groupId?: string
  groupLabel?: string
  hasTaskList?: boolean

  clientName?: string
  contractNumber?: string
  contractType?: string

  cep?: string
  address?: string
  neighborhood?: string
  city?: string
  state?: string

  responsibleName?: string
  responsibleCrea?: string
  artNumber?: string
  totalArea?: string

  startDate?: string
  endDateForecast?: string

  description?: string
}

/**
 * Cadastro simples atual:
 * - name obrigatório
 * - status obrigatório
 * - registrationMode SIMPLE
 * - groupId é opcional na API
 * - obra fica com cadastro incompleto por definição
 */
export function generateMinimalWorksite(
  status: WorksiteStatus = 'PLANEJAMENTO',
): WorksiteData {
  const suffix = uniqueSuffix()

  return {
    name: `Obra Automação Mínima ${suffix}`,
    status,
    registrationMode: 'SIMPLE',
  }
}

/**
 * Usado nos testes de diário.
 * O app só permite criar diário para obra em andamento.
 */
export function generateActiveMinimalWorksite(): WorksiteData {
  return generateMinimalWorksite('EM_ANDAMENTO')
}

/**
 * Cadastro completo:
 * - registrationMode COMPLETE
 * - responsável técnico, início e previsão são obrigatórios
 * - demais campos ajudam a cobrir o fluxo completo do formulário
 */
export function generateCompleteWorksite(): WorksiteData {
  const suffix = uniqueSuffix()

  return {
    name: `Obra Automação Completa ${suffix}`,
    status: 'EM_ANDAMENTO',
    registrationMode: 'COMPLETE',

    clientName: `Condomínio Teste ${suffix}`,
    contractNumber: `CT-QA-${suffix}`,
    contractType: 'Empreitada global',

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

/**
 * Previsão anterior à data de início.
 * Usado para validar regra de negócio de cronograma.
 */
export function generateWorksiteWithInvalidDateRange(): WorksiteData {
  const base = generateCompleteWorksite()

  return {
    ...base,
    startDate: futureDateISO(30),
    endDateForecast: futureDateISO(5),
  }
}