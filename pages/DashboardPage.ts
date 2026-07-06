import { expect, type Page, type Locator } from '@playwright/test'
import { routes } from '../utils/routes'

export class DashboardPage {
  readonly page: Page
  readonly greeting: Locator
  readonly userMenuButton: Locator
  readonly logoutMenuItem: Locator
  readonly navObras: Locator
  readonly navUsuarios: Locator
  readonly navDiarios: Locator

  constructor(page: Page) {
    this.page = page
    this.greeting = page.getByRole('heading', { level: 1 })
    this.userMenuButton = page.getByLabel('Menu do usuário')
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Sair' })
    this.navObras = page.getByRole('link', { name: 'Obras' })
    this.navUsuarios = page.getByRole('link', { name: 'Usuários' })
    this.navDiarios = page.getByRole('link', { name: 'Diários' })
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(routes.dashboard))
    await expect(this.greeting).toBeVisible()
  }

  async expectUserLoggedIn(name?: string): Promise<void> {
    await expect(this.greeting).toBeVisible()
    if (name) {
      await expect(this.greeting).toContainText(name)
    }
  }

  async goToWorksites(): Promise<void> {
    await this.navObras.click()
    await this.page.waitForURL(new RegExp(routes.worksites))
  }

  async goToUsers(): Promise<void> {
    await this.navUsuarios.click()
    await this.page.waitForURL(new RegExp(routes.users))
  }

  async logout(): Promise<void> {
    await this.userMenuButton.click()
    await this.logoutMenuItem.click()
    await this.page.waitForURL(new RegExp(routes.login))
  }
}
