/**
 * Rotas oficiais da aplicação ObraFlow.
 *
 * Centralizar as rotas evita strings diferentes espalhadas
 * pelos testes e Page Objects.
 */
export const routes = {
  login: '/login',
  forgotPassword: '/forgot-password',

  dashboard: '/dashboard',

  worksites: '/obras',
  newWorksite: '/obras/nova',
  worksite: (id: string) => `/obras/${id}`,
  worksiteTeam: (id: string) => `/obras/${id}/equipe`,
  worksiteDailyLogs: (id: string) => `/obras/${id}/diarios`,

  dailyLogs: '/diarios',
  dailyLog: (id: string) => `/diarios/${id}`,
  editDailyLog: (id: string) => `/diarios/${id}/editar`,
  newDailyLog: (worksiteId: string) =>
    `/obras/${worksiteId}/diarios/novo`,

  users: '/cadastros/usuarios',

  client: '/client',
} as const