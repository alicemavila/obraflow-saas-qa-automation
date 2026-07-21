import { test, expect, type Page } from '@playwright/test'

import { LoginPage } from '../../../pages/LoginPage'
import { WorksiteFormPage } from '../../../pages/WorksiteFormPage'
import { WorksitesPage } from '../../../pages/WorksitesPage'
import { adminUser } from '../../../fixtures/users'
import { generateActiveMinimalWorksite } from '../../../fixtures/worksites'
import {
  generateActivity,
  generateDailyLogHeader,
} from '../../../fixtures/daily-logs'

async function createActiveWorksiteAndOpen(page: Page): Promise<string> {
  const worksitesPage = new WorksitesPage(page)
  const form = new WorksiteFormPage(page)
  const data = generateActiveMinimalWorksite()

  await worksitesPage.goto()
  await worksitesPage.expectLoaded()

  await worksitesPage.openAddWorksite()
  await form.fillWorksite(data)
  await form.submit()

  await page.waitForURL(/\/obras\/[\w-]{20,}$/, { timeout: 30_000 })

  await expect(page.getByText(data.name)).toBeVisible()
  await expect(page.getByText(/em andamento/i)).toBeVisible()

  return page.url()
}

async function openNewDailyLog(page: Page): Promise<void> {
  await page.getByRole('link', { name: /novo diário/i }).click()

  await page.waitForURL(/\/obras\/[\w-]{20,}\/diarios\/novo$/, {
    timeout: 30_000,
  })

  await expect(
    page.getByRole('heading', { name: /novo diário de obra/i }),
  ).toBeVisible()
}

async function createDailyLogHeader(page: Page): Promise<void> {
  const header = generateDailyLogHeader()

  await page.getByLabel(/data/i).fill(header.date)

  const weatherMorning = page.getByLabel(/manhã/i)
  if (await weatherMorning.isVisible().catch(() => false)) {
    await weatherMorning.selectOption(header.weatherMorning)
  }

  const notes = page.getByLabel(/observações gerais/i)
  if (await notes.isVisible().catch(() => false)) {
    await notes.fill(header.notes)
  }

  await page.getByRole('button', { name: /criar diário e continuar/i }).click()

  await page.waitForURL(/\/diarios\/[\w-]{20,}\/editar$/, {
    timeout: 30_000,
  })
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

    await page.getByTestId('add-activity-button').click()
    await page.getByLabel(/descrição/i).fill(activity.description)

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

    await page.getByTestId('submit-activity-button').click()

    await expect(page.getByText(activity.description)).toBeVisible()
  })

  test('@regression @dailylog diário exige data para ser criado', async ({
    page,
  }) => {
    await createActiveWorksiteAndOpen(page)
    await openNewDailyLog(page)

    await page.getByLabel(/data/i).fill('')
    await page.getByRole('button', { name: /criar diário e continuar/i }).click()

    await expect(page).toHaveURL(/\/obras\/[\w-]{20,}\/diarios\/novo$/)
  })

  test('@regression @dailylog não é possível enviar para aprovação um diário vazio', async ({
    page,
  }) => {
    await createActiveWorksiteAndOpen(page)
    await openNewDailyLog(page)
    await createDailyLogHeader(page)

    await page
      .getByRole('button', { name: /enviar para aprovação/i })
      .click()

    await expect(
      page.getByText(/deve ter ao menos uma atividade|ao menos uma atividade/i),
    ).toBeVisible()
  })
})