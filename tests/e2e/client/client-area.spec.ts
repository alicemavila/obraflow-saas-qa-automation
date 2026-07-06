import { test, expect } from '@playwright/test'
import { LoginPage } from '../../../pages/LoginPage'
import { ClientAreaPage } from '../../../pages/ClientAreaPage'
import { clienteUser } from '../../../fixtures/users'
import { routes } from '../../../utils/routes'

/**
 * ⚠️ GAP CONHECIDO — ver docs/risk-matrix.md
 *
 * O Portal Cliente/Síndico (/client) ainda não foi implementado no
 * ObraFlow. O middleware já redireciona CLIENTE_SINDICO para essa rota,
 * mas a página não existe (404 atualmente).
 *
 * Os três primeiros testes usam `test.fixme()`: eles descrevem o
 * comportamento ESPERADO da feature e ficam automaticamente "pulados" até
 * alguém remover o `test.fixme` — nesse momento o Playwright passa a
 * cobrar que a lógica realmente funcione. Isso evita dois problemas
 * comuns: (a) esquecer de escrever o teste quando a feature for
 * implementada, e (b) a suíte "vermelha" indefinidamente por uma feature
 * que sabidamente não existe ainda.
 *
 * O último teste, fora do bloco de fixme, valida o comportamento ATUAL
 * (o redirecionamento do middleware) — esse já roda e passa hoje.
 */
test.describe('Portal Cliente/Síndico', () => {
  test.fixme('@smoke @client login como CLIENTE_SINDICO carrega o portal do cliente', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const clientArea = new ClientAreaPage(page)

    await loginPage.goto()
    await loginPage.login(clienteUser.email, clienteUser.password)

    await clientArea.expectLoaded()
  })

  test.fixme('@regression @client menu administrativo não aparece para o cliente', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const clientArea = new ClientAreaPage(page)

    await loginPage.goto()
    await loginPage.login(clienteUser.email, clienteUser.password)

    await clientArea.expectAdminMenuNotVisible()
  })

  test.fixme('@regression @client cliente vê apenas as obras às quais está vinculado', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const clientArea = new ClientAreaPage(page)

    await loginPage.goto()
    await loginPage.login(clienteUser.email, clienteUser.password)

    await clientArea.expectOnlyAuthorizedWorksitesVisible()
  })

  test('@regression @client [comportamento atual] middleware redireciona cliente para /client em qualquer rota', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(clienteUser.email, clienteUser.password)

    await page.goto(routes.dashboard)
    await expect(page).toHaveURL(new RegExp(routes.client))
  })
})
