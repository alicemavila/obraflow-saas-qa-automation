import type { Page } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { routes } from './routes'
import type { TestUser } from '../fixtures/users'

/**
 * Faz login via UI e salva o storageState (cookies de sessão do NextAuth)
 * no caminho informado. Usado pelo setup de autenticação (tests/e2e/auth.setup.ts)
 * para gerar sessões reutilizáveis por outros specs e pelos testes de API.
 */
export async function loginAndSaveState(page: Page, user: TestUser, storagePath: string): Promise<void> {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(user.email, user.password)
  // Timeout generoso: em modo dev, o Next.js compila as rotas sob demanda
  // na primeira requisição (login + /dashboard), o que pode levar bem mais
  // que os 15s "normais" de produção.
  await page.waitForURL((url) => !url.pathname.startsWith(routes.login), { timeout: 45_000 })
  await page.context().storageState({ path: storagePath })
}

/**
 * Garante que a página está autenticada como o usuário informado.
 * Se já estiver logado (ex: veio de um storageState), não faz nada;
 * caso contrário, loga via UI.
 */
export async function ensureLoggedIn(page: Page, user: TestUser): Promise<void> {
  await page.goto(routes.dashboard)
  if (page.url().includes(routes.login)) {
    const loginPage = new LoginPage(page)
    await loginPage.login(user.email, user.password)
    await page.waitForURL((url) => !url.pathname.startsWith(routes.login), { timeout: 45_000 })
  }
}

/** Caminho padrão do storageState salvo para cada perfil. */
export function authStatePath(roleKey: 'admin' | 'super-admin' | 'gestor' | 'colaborador' | 'cliente'): string {
  return `.auth/${roleKey}.json`
}