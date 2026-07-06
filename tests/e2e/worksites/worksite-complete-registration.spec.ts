import { test, expect } from '@playwright/test'
import { LoginPage } from '../../../pages/LoginPage'
import { WorksitesPage } from '../../../pages/WorksitesPage'
import { WorksiteFormPage } from '../../../pages/WorksiteFormPage'
import { adminUser } from '../../../fixtures/users'
import { generateCompleteWorksite, generateWorksiteWithInvalidDateRange } from '../../../fixtures/worksites'
import { routes } from '../../../utils/routes'

test.describe('Obras — Cadastro completo (todos os campos)', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(adminUser.email, adminUser.password)
    await page.waitForURL(
      (url) => !url.pathname.startsWith(routes.login),
      { timeout: 45_000 },
    )
  })

  test('@smoke @worksites cria obra preenchendo todos os campos, incluindo opcionais', async ({ page }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)
    const data = generateCompleteWorksite()

    await worksitesPage.goto()
    await worksitesPage.openAddWorksite()
    await form.expectOptionalFieldsVisible()

    await form.fillWorksite(data)
    await form.submit()

    await page.waitForURL(/\/obras\/[\w-]{20,}$/, { timeout: 30_000 })
    await expect(page.getByText(data.name)).toBeVisible()
    await expect(page.getByText(data.clientName!)).toBeVisible()
    await expect(page.getByText(data.responsibleName)).toBeVisible()
  })

  test('@regression @worksites bloqueia previsão de conclusão anterior à data de início', async ({ page }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)
    const data = generateWorksiteWithInvalidDateRange()

    await worksitesPage.goto()
    await worksitesPage.openAddWorksite()
    await form.fillWorksite(data)
    await form.submit()

    await form.expectValidationMessage(/data de início não pode ser posterior à previsão de conclusão/i)
    // Não deve navegar para a página de detalhe — permanece no formulário
    await expect(page).toHaveURL(/\/obras\/nova$/)
  })

  test('@regression @worksites mantém os dados preenchidos após corrigir um erro e reenviar', async ({ page }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)
    const data = generateCompleteWorksite()

    await worksitesPage.goto()
    await worksitesPage.openAddWorksite()

    // Preenche tudo, exceto o campo obrigatório de responsável técnico
    await form.fillWorksite({ ...data, responsibleName: undefined })
    await form.submit()
    await form.expectValidationMessage(/responsável técnico obrigatório/i)

    // Corrige e reenvia — os demais campos não devem ter sido perdidos
    await expect(form.nameInput).toHaveValue(data.name)
    await form.responsibleNameInput.fill(data.responsibleName)
    await form.submit()

    await page.waitForURL(/\/obras\/[\w-]{20,}$/, { timeout: 30_000 })
  })
})
