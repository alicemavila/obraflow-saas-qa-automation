import { expect, test } from '@playwright/test'

import { LoginPage } from '../../../pages/LoginPage'
import { WorksiteFormPage } from '../../../pages/WorksiteFormPage'
import { WorksitesPage } from '../../../pages/WorksitesPage'

import { adminUser } from '../../../fixtures/users'

import {
  generateCompleteWorksite,
  generateWorksiteWithInvalidDateRange,
} from '../../../fixtures/worksites'

test.describe('Obras — Cadastro completo', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    await loginPage.loginAndWaitForRedirect(
      adminUser.email,
      adminUser.password,
    )
  })

  test('@smoke @worksites cria obra preenchendo todos os campos, incluindo opcionais', async ({
    page,
  }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)
    const data = generateCompleteWorksite()

    await worksitesPage.goto()
    await worksitesPage.expectLoaded()

    await worksitesPage.openAddWorksite()
    await form.expectModalVisible()

    /*
     * A seleção explícita preserva a validação do comportamento
     * do botão. fillWorksite não clicará novamente porque a seleção
     * agora é idempotente.
     */
    await form.selectCompleteRegistration()
    await form.expectOptionalFieldsVisible()

    await form.fillWorksite(data)
    await form.submit()

    await page.waitForURL(/\/obras\/[\w-]{20,}$/, {
      timeout: 30_000,
    })

    await expect(
      page.getByText(data.name).first(),
    ).toBeVisible()

    await expect(
      page.getByText(data.clientName!).first(),
    ).toBeVisible()

    await expect(
      page.getByText(data.responsibleName!).first(),
    ).toBeVisible()
  })

  test('@regression @worksites bloqueia previsão de conclusão anterior à data de início', async ({
    page,
  }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)

    const data = generateWorksiteWithInvalidDateRange()

    await worksitesPage.goto()
    await worksitesPage.expectLoaded()

    await worksitesPage.openAddWorksite()
    await form.expectModalVisible()

    await form.selectCompleteRegistration()
    await form.expectOptionalFieldsVisible()

    await form.fillWorksite(data)
    await form.submit()

    await form.expectValidationMessage(
      /previsão de término não pode ser anterior à data de início/i,
    )

    await form.expectModalVisible()
  })

  test('@regression @worksites mantém os dados preenchidos após corrigir um erro e reenviar', async ({
    page,
  }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)

    const data = generateCompleteWorksite()

    await worksitesPage.goto()
    await worksitesPage.expectLoaded()

    await worksitesPage.openAddWorksite()
    await form.expectModalVisible()

    await form.selectCompleteRegistration()
    await form.expectOptionalFieldsVisible()

    await form.fillWorksite({
      ...data,
      responsibleName: undefined,
    })

    await form.submit()

    await form.expectValidationMessage(
      /cadastro completo requer responsável técnico|responsável técnico obrigatório/i,
    )

    await expect(form.nameInput).toHaveValue(data.name)

    await form.responsibleNameInput.fill(
      data.responsibleName!,
    )

    await form.submit()

    await page.waitForURL(/\/obras\/[\w-]{20,}$/, {
      timeout: 30_000,
    })

    await expect(
      page.getByText(data.name).first(),
    ).toBeVisible()
  })
})