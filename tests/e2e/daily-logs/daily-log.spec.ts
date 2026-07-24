import { expect, test, type Page } from '@playwright/test'

import { LoginPage } from '../../../pages/LoginPage'
import { WorksiteFormPage } from '../../../pages/WorksiteFormPage'
import { WorksitesPage } from '../../../pages/WorksitesPage'

import { adminUser } from '../../../fixtures/users'

import {
  generateActiveMinimalWorksite,
} from '../../../fixtures/worksites'

import {
  generateActivity,
  generateDailyLogHeader,
} from '../../../fixtures/daily-logs'

async function createActiveWorksiteAndOpen(
  page: Page,
): Promise<string> {
  const worksitesPage = new WorksitesPage(page)
  const form = new WorksiteFormPage(page)

  const data = generateActiveMinimalWorksite()

  await worksitesPage.goto()
  await worksitesPage.expectLoaded()

  await worksitesPage.openAddWorksite()
  await form.expectModalVisible()

  /*
   * O cadastro mínimo normalmente utiliza o modo SIMPLE.
   *
   * O método é idempotente: se o modo simples já estiver ativo,
   * o Playwright não realizará um novo clique.
   */
  await form.selectSimpleRegistration()

  await form.fillWorksite(data)
  await form.submit()

  await page.waitForURL(/\/obras\/[\w-]{20,}$/, {
    timeout: 30_000,
  })

  await expect(
    page.getByText(data.name).first(),
  ).toBeVisible()

  await expect(
    page.getByText(/em andamento/i).first(),
  ).toBeVisible()

  return page.url()
}

async function openNewDailyLog(
  page: Page,
): Promise<void> {
  const newDailyLogLink = page.getByRole('link', {
    name: /novo diário/i,
  })

  await expect(newDailyLogLink).toBeVisible()
  await newDailyLogLink.click()

  await page.waitForURL(
    /\/obras\/[\w-]{20,}\/diarios\/novo$/,
    {
      timeout: 30_000,
    },
  )

  await expect(
    page.getByRole('heading', {
      name: /novo diário de obra/i,
    }),
  ).toBeVisible()
}

async function createDailyLogHeader(
  page: Page,
): Promise<void> {
  const header = generateDailyLogHeader()

  const dateInput = page.getByLabel(/data/i)

  await expect(dateInput).toBeVisible()
  await dateInput.fill(header.date)

  const weatherMorning = page.getByLabel(/manhã/i)

  if (await weatherMorning.isVisible().catch(() => false)) {
    await weatherMorning.selectOption(
      header.weatherMorning,
    )
  }

  const notes = page.getByLabel(
    /observações gerais/i,
  )

  if (await notes.isVisible().catch(() => false)) {
    await notes.fill(header.notes)
  }

  const createButton = page.getByRole('button', {
    name: /criar diário e continuar/i,
  })

  await expect(createButton).toBeVisible()
  await expect(createButton).toBeEnabled()

  await createButton.click()

  await page.waitForURL(
    /\/diarios\/[\w-]{20,}\/editar$/,
    {
      timeout: 30_000,
    },
  )
}

test.describe('Diário de Obra', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    await loginPage.loginAndWaitForRedirect(
      adminUser.email,
      adminUser.password,
    )
  })

  test('@smoke @dailylog cria o cabeçalho do diário e adiciona uma atividade', async ({
    page,
  }) => {
    await createActiveWorksiteAndOpen(page)
    await openNewDailyLog(page)
    await createDailyLogHeader(page)

    const activity = generateActivity()

    const addActivityButton = page.getByTestId(
      'add-activity-button',
    )

    await expect(addActivityButton).toBeVisible()
    await addActivityButton.click()

    const descriptionInput = page.getByLabel(
      /descrição/i,
    )

    await expect(descriptionInput).toBeVisible()
    await descriptionInput.fill(activity.description)

    const location = page.getByLabel(/local/i)

    if (await location.isVisible().catch(() => false)) {
      await location.fill(activity.location)
    }

    const quantity = page.getByLabel(/quantidade/i)

    if (await quantity.isVisible().catch(() => false)) {
      await quantity.fill(activity.quantity)
    }

    const unit = page.getByLabel(/unidade/i)

    if (await unit.isVisible().catch(() => false)) {
      await unit.fill(activity.unit)
    }

    const progress = page.getByLabel(/progresso/i)

    if (await progress.isVisible().catch(() => false)) {
      await progress.fill(activity.progress)
    }

    const submitActivityButton = page.getByTestId(
      'submit-activity-button',
    )

    await expect(submitActivityButton).toBeVisible()
    await expect(submitActivityButton).toBeEnabled()

    await submitActivityButton.click()

    await expect(
      page.getByText(activity.description).first(),
    ).toBeVisible()
  })

  test('@regression @dailylog diário exige data para ser criado', async ({
    page,
  }) => {
    await createActiveWorksiteAndOpen(page)
    await openNewDailyLog(page)

    const dateInput = page.getByLabel(/data/i)

    await expect(dateInput).toBeVisible()
    await dateInput.fill('')

    await page
      .getByRole('button', {
        name: /criar diário e continuar/i,
      })
      .click()

    await expect(page).toHaveURL(
      /\/obras\/[\w-]{20,}\/diarios\/novo$/,
    )
  })

  test('@regression @dailylog não é possível enviar para aprovação um diário vazio', async ({
    page,
  }) => {
    await createActiveWorksiteAndOpen(page)
    await openNewDailyLog(page)
    await createDailyLogHeader(page)

    const approvalButton = page.getByRole('button', {
      name: /enviar para aprovação/i,
    })

    await expect(approvalButton).toBeVisible()
    await approvalButton.click()

    await expect(
      page
        .getByText(
          /deve ter ao menos uma atividade|ao menos uma atividade/i,
        )
        .first(),
    ).toBeVisible()
  })
})