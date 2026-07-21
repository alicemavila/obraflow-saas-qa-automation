import { test, expect } from '@playwright/test'

import { DashboardPage } from '../../../pages/DashboardPage'
import { LoginPage } from '../../../pages/LoginPage'
import { adminUser, invalidUser } from '../../../fixtures/users'
import { routes } from '../../../utils/routes'

test.describe('Autenticação — Login', () => {
  test('@smoke @auth login válido como ADMIN_EMPRESA acessa o dashboard', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page)
    const dashboard = new DashboardPage(page)

    await loginPage.goto()
    await loginPage.expectLoginPageLoaded()
    await loginPage.loginAndWaitForRedirect(
      adminUser.email,
      adminUser.password,
    )

    await dashboard.expectLoaded()
  })

  test('@regression @auth login com credenciais inválidas mostra erro e bloqueia acesso', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login(invalidUser.email, invalidUser.password)

    await loginPage.expectInvalidCredentialsMessage()
    await expect(page).toHaveURL(new RegExp(routes.login))
  })

  test('@regression @auth campos obrigatórios são validados ao tentar enviar vazio', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.expectRequiredFieldsValidation()
  })

  test('@regression @auth logout retorna ao login e bloqueia rota protegida', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page)
    const dashboard = new DashboardPage(page)

    await loginPage.goto()
    await loginPage.loginAndWaitForRedirect(
      adminUser.email,
      adminUser.password,
    )

    await dashboard.expectLoaded()
    await dashboard.logout()

    await expect(page).toHaveURL(new RegExp(routes.login))

    await page.goto(routes.dashboard)
    await expect(page).toHaveURL(new RegExp(routes.login))
  })
})