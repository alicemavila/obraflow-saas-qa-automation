import { todayISO, uniqueSuffix } from '../utils/test-data'

/**
 * O diário de obra no ObraFlow é criado em duas etapas:
 * 1) POST /obras/:id/diarios/novo cria o "cabeçalho" (data + clima) e
 *    redireciona para a edição.
 * 2) Em /diarios/:id/editar são adicionadas atividades, mão de obra,
 *    materiais e ocorrências antes de submeter para aprovação.
 */

export interface DailyLogHeaderData {
  date: string
  weatherMorning: string
  notes: string
}

export function generateDailyLogHeader(): DailyLogHeaderData {
  return {
    date: todayISO(),
    weatherMorning: 'ENSOLARADO',
    notes: `Diário gerado pela suíte de automação — ${uniqueSuffix()}`,
  }
}

export interface ActivityData {
  description: string
  location: string
  quantity: string
  unit: string
  progress: string
}

export function generateActivity(): ActivityData {
  const suffix = uniqueSuffix()
  return {
    description: `Atividade de automação ${suffix}`,
    location: 'Pavimento térreo',
    quantity: '10',
    unit: 'm²',
    progress: '50',
  }
}

export interface LaborData {
  role: string
  quantity: string
  contractor: string
}

export function generateLabor(): LaborData {
  return {
    role: 'Pedreiro',
    quantity: '3',
    contractor: 'Empreiteira Automação Ltda',
  }
}
