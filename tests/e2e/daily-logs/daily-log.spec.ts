import { test, expect } from '@playwright/test'
import { LoginPage } from '../../../pages/LoginPage'
import { WorksitesPage } from '../../../pages/WorksitesPage'
import { WorksiteFormPage } from '../../../pages/WorksiteFormPage'
import { adminUser } from '../../../fixtures/users'
import { generateMinimalWorksite } from '../../../fixtures/worksites'
import { generateDailyLogHeader, generateActivity } from '../../../fixtures/daily-logs'

/**
 * Nota de adaptação: o diário no ObraFlow é criado em DUAS etapas —
 * 1) cabeçalho (data + clima) em /obras/:id/diarios/novo
 * 2) atividades/mão de obra/materiais/ocorrências em /diarios/:id/editar
 * Não existe um formulário único de "criar relatório" com campo de
 * observação livre que já salva tudo de uma vez.
 *
 * Cada teste cria sua própria obra antes, para não depender de massa fixa
 * do seed (evita testes acoplados/flakiness entre execuções).
 */
async function createWorksiteAndOpen(page: import('@playwright/test').Page) {
  const worksitesPage = new WorksitesPage(page)
  const form = new WorksiteFormPage(page)
  const data = generateMinimalWorksite()

  await worksitesPage.goto()
  await worksitesPage.openAddWorksite()
  await form.fillWorksite(data)
  await form.submit()
  await page.waitForURL(/\/obras\/[a-f0-9-]{36}$/)

  return page.url()
}

test.describe('Diário de Obra', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(adminUser.email, adminUser.password)
  })

  test('@smoke @dailylog cria o cabeçalho do diário e adiciona uma atividade', async ({ page }) => {
    const worksiteUrl = await createWorksiteAndOpen(page)

    await page.getByRole('link', { name: 'Novo diário' }).click()
    await page.waitForURL(/\/diarios\/novo$/)

    const header = generateDailyLogHeader()
    await page.getByLabel('Data *').fill(header.date)
    await page.getByRole('button', { name: 'Criar diário e continuar' }).click()

    // Redireciona para a edição
    await page.waitForURL(/\/diarios\/[a-f0-9-]{36}\/editar$/)

    const activity = generateActivity()
    await page.getByTestId('add-activity-button').click()
    await page.getByLabel('Descrição *').fill(activity.description)
    await page.getByTestId('submit-activity-button').click()

    await expect(page.getByText(activity.description)).toBeVisible()
    void worksiteUrl
  })

  test('@regression @dailylog diário exige data para ser criado', async ({ page }) => {
    await createWorksiteAndOpen(page)

    await page.getByRole('link', { name: 'Novo diário' }).click()
    await page.waitForURL(/\/diarios\/novo$/)

    await page.getByLabel('Data *').fill('')
    await page.getByRole('button', { name: 'Criar diário e continuar' }).click()

    // O <input type="date" required> bloqueia o envio nativamente;
    // como alternativa, garantimos que a navegação não ocorreu.
    await expect(page).toHaveURL(/\/diarios\/novo$/)
  })

  test('@regression @dailylog não é possível enviar para aprovação um diário vazio', async ({ page }) => {
    await createWorksiteAndOpen(page)

    await page.getByRole('link', { name: 'Novo diário' }).click()
    await page.waitForURL(/\/diarios\/novo$/)
    const header = generateDailyLogHeader()
    await page.getByLabel('Data *').fill(header.date)
    await page.getByRole('button', { name: 'Criar diário e continuar' }).click()
    await page.waitForURL(/\/diarios\/[a-f0-9-]{36}\/editar$/)

    await page.getByRole('button', { name: 'Enviar para aprovação' }).click()

    await expect(page.getByText(/deve ter ao menos uma atividade ou registro de mão de obra/i)).toBeVisible()
  })
})
