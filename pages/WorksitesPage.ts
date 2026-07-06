import { expect, type Page, type Locator } from '@playwright/test'
import { routes } from '../utils/routes'

export class WorksitesPage {
  readonly page: Page
  readonly heading: Locator
  /**
   * Aceita tanto <a> quanto <button> com o texto "Nova obra".
   * Alguns frameworks de UI renderizam o botão de criação como link
   * quando há rota definida e como button quando é modal — o role
   * "button" ou "link" pode variar dependendo da implementação.
   */
  readonly newWorksiteButton: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Obras' })
    // Usa a estratégia mais resiliente: tenta link primeiro, recai em button
    this.newWorksiteButton = page.getByRole('link', { name: /nova obra/i }).or(
      page.getByRole('button', { name: /nova obra/i }),
    )
    this.emptyState = page.getByText('Nenhuma obra cadastrada')
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.worksites)
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible()
  }

  async openAddWorksite(): Promise<void> {
    await this.newWorksiteButton.click()
    await this.page.waitForURL(new RegExp(routes.newWorksite))
  }

  /**
   * Não há campo de busca na listagem atual — a validação de presença
   * é feita diretamente pelo nome do card na grade.
   */
  worksiteCard(name: string): Locator {
    return this.page.locator('a', { hasText: name }).first()
  }

  async expectWorksiteVisible(name: string): Promise<void> {
    await expect(this.worksiteCard(name)).toBeVisible()
  }

  async expectStatusVisible(name: string, statusLabel: string): Promise<void> {
    await expect(this.worksiteCard(name)).toContainText(statusLabel)
  }

  async expectAddButtonHidden(): Promise<void> {
    await expect(this.newWorksiteButton).toHaveCount(0)
  }
}
