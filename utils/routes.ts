/**
 * Rotas da aplicação ObraFlow, centralizadas para evitar strings mágicas
 * espalhadas pelos testes e Page Objects.
 */
export const routes = {
  login: '/login',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  worksites: '/obras',
  newWorksite: '/obras/nova',
  worksite: (id: string) => `/obras/${id}`,
  worksiteDailyLogs: (id: string) => `/obras/${id}/diarios`,
  newDailyLog: (worksiteId: string) => `/obras/${worksiteId}/diarios/novo`,
  worksiteTeam: (id: string) => `/obras/${id}/equipe`,
  dailyLog: (id: string) => `/diarios/${id}`,
  editDailyLog: (id: string) => `/diarios/${id}/editar`,
  dailyLogs: '/diarios',
  users: '/admin/usuarios',
  client: '/client',
} as const
