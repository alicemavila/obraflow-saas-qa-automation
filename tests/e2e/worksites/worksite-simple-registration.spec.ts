import { test, expect } from '@playwright/test'

import { LoginPage } from '../../../pages/LoginPage'
import { WorksiteFormPage } from '../../../pages/WorksiteFormPage'
import { WorksitesPage } from '../../../pages/WorksitesPage'
import { adminUser } from '../../../fixtures/users'
import { generateMinimalWorksite } from '../../../fixtures/worksites'

test.describe('Obras — Cadastro simples', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.loginAndWaitForRedirect(
      adminUser.email,
      adminUser.password,
    )
  })

  test('@smoke @worksites cria obra preenchendo apenas os campos obrigatórios', async ({
    page,
  }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)
    const data = generateMinimalWorksite()

    await worksitesPage.goto()
    await worksitesPage.expectLoaded()

    await worksitesPage.openAddWorksite()
    await form.expectRequiredFieldsVisible()

    await form.fillWorksite(data)
    await form.submit()

    await page.waitForURL(/\/obras\/[\w-]{20,}$/, { timeout: 30_000 })

    await expect(page.getByText(data.name)).toBeVisible()
    await expect(page.getByText(/planejamento/i)).toBeVisible()
    await expect(page.getByText(/cadastro incompleto/i).first()).toBeVisible()
  })

  test('@regression @worksites valida obrigatoriedade do nome no cadastro simples', async ({
    page,
  }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)

    await worksitesPage.goto()
    await worksitesPage.expectLoaded()

    await worksitesPage.openAddWorksite()
    await form.expectRequiredFieldsVisible()

    await form.submit()

    await form.expectValidationMessage(/nome deve ter ao menos/i)
  })
})