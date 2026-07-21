import { expect, type Locator, type Page } from '@playwright/test'

import { routes } from '../utils/routes'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export class WorksitesPage {
  readonly page: Page
  readonly heading: Locator
  readonly addMenuButton: Locator
  readonly addWorksiteMenuItem: Locator
  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /^Obras$/i })

    this.addMenuButton = page
      .getByRole('button', { name: /adicionar novo item|adicionar/i })
      .first()

    this.addWorksiteMenuItem = page
      .getByRole('menuitem', { name: /adicionar obra/i })
      .or(page.getByRole('button', { name: /adicionar obra/i }))
      .or(page.getByText(/^Adicionar Obra$/i))
      .first()

    this.emptyState = page.getByText(/nenhuma obra cadastrada/i)
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.worksites)
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(routes.worksites))
    await expect(this.heading).toBeVisible()
  }

  async openAddWorksite(): Promise<void> {
    await expect(this.addMenuButton).toBeVisible()
    await this.addMenuButton.click()

    await expect(this.addWorksiteMenuItem).toBeVisible()
    await this.addWorksiteMenuItem.click()

    await expect(
      this.page.getByRole('heading', { name: /adicionar obra/i }),
    ).toBeVisible()
  }

  worksiteCard(name: string): Locator {
    return this.page
      .locator('a')
      .filter({ hasText: new RegExp(escapeRegExp(name), 'i') })
      .first()
  }

  async expectWorksiteVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name).first()).toBeVisible()
  }

  async expectStatusVisible(name: string, statusLabel: string): Promise<void> {
    const card = this.worksiteCard(name)

    if ((await card.count()) > 0) {
      await expect(card).toContainText(statusLabel)
      return
    }

    await expect(this.page.getByText(statusLabel).first()).toBeVisible()
  }

  async expectAddButtonHidden(): Promise<void> {
    await expect(this.addMenuButton).toHaveCount(0)
  }
}