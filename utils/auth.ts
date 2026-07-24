import type { Page } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { routes } from './routes'
import type { TestUser } from '../fixtures/users'

type AuthenticatedRole = Exclude<TestUser['role'], 'INVALID'>

interface AuthSessionResponse {
  user?: {
    id?: string
    email?: string | null
    role?: AuthenticatedRole
    companyId?: string | null
    companySlug?: string | null
  }
}

/**
 * Confirma que a sessão criada realmente pertence ao usuário
 * e ao perfil esperados.
 */
async function validateAuthenticatedSession(
  page: Page,
  user: TestUser,
): Promise<void> {
  if (user.role === 'INVALID') {
    throw new Error(
      'Não é possível validar sessão autenticada para usuário inválido.',
    )
  }

  const sessionUrl = new URL(
    '/api/auth/session',
    page.url(),
  ).toString()

  const response = await page.request.get(sessionUrl)

  if (!response.ok()) {
    throw new Error(
      `Falha ao consultar a sessão de ${user.label}. ` +
        `Status recebido: ${response.status()}.`,
    )
  }

  const session =
    (await response.json()) as AuthSessionResponse

  if (!session.user) {
    throw new Error(
      `Login de ${user.label} não criou uma sessão válida.`,
    )
  }

  const expectedEmail = user.email.trim().toLowerCase()
  const actualEmail =
    session.user.email?.trim().toLowerCase()

  if (actualEmail !== expectedEmail) {
    throw new Error(
      `Sessão incorreta para ${user.label}. ` +
        `Esperado: ${expectedEmail}. ` +
        `Recebido: ${actualEmail ?? 'sem e-mail'}.`,
    )
  }

  if (session.user.role !== user.role) {
    throw new Error(
      `Perfil incorreto para ${user.label}. ` +
        `Esperado: ${user.role}. ` +
        `Recebido: ${session.user.role ?? 'sem perfil'}.`,
    )
  }

  /*
   * SUPER_ADMIN pode não estar vinculado a uma empresa.
   * Os demais perfis precisam possuir companyId.
   */
  if (
    user.role !== 'SUPER_ADMIN' &&
    !session.user.companyId
  ) {
    throw new Error(
      `${user.label} foi autenticado sem companyId.`,
    )
  }
}

/**
 * Faz login, valida o usuário/perfil e salva o storageState.
 */
export async function loginAndSaveState(
  page: Page,
  user: TestUser,
  storagePath: string,
): Promise<void> {
  const loginPage = new LoginPage(page)

  await loginPage.goto()

  await loginPage.loginAndWaitForRedirect(
    user.email,
    user.password,
  )

  await validateAuthenticatedSession(page, user)

  await page.context().storageState({
    path: storagePath,
  })
}

/**
 * Garante que a página está autenticada como o usuário informado.
 */
export async function ensureLoggedIn(
  page: Page,
  user: TestUser,
): Promise<void> {
  await page.goto(routes.dashboard)

  if (page.url().includes(routes.login)) {
    const loginPage = new LoginPage(page)

    await loginPage.loginAndWaitForRedirect(
      user.email,
      user.password,
    )
  }

  await validateAuthenticatedSession(page, user)
}

/**
 * Caminho do storageState salvo para cada perfil.
 */
export function authStatePath(
  roleKey:
    | 'admin'
    | 'super-admin'
    | 'gestor'
    | 'colaborador'
    | 'cliente',
): string {
  return `.auth/${roleKey}.json`
}