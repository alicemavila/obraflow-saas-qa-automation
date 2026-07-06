import { expect, type Page, type Locator } from '@playwright/test'
import { routes } from '../utils/routes'

/**
 * O ObraFlow não tem "criar usuário com senha" pelo admin — o fluxo real é
 * convite por e-mail (nome + e-mail + perfil). O próprio usuário define a
 * senha ao aceitar o convite em /accept-invite. Este Page Object reflete
 * exatamente esse fluxo.
 */
export class UsersPage {
  readonly page: Page
  readonly heading: Locator
  readonly inviteButton: Locator
  readonly modal: Locator
  readonly nameInput: Locator
  readonly emailInput: Locator
  readonly roleSelect: Locator
  readonly modalSubmitButton: Locator
  readonly modalError: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Usuários' })
    this.inviteButton = page.getByRole('button', { name: 'Convidar usuário' })
    this.modal = page.getByRole('dialog')
    this.nameInput = page.locator('#inv-name')
    this.emailInput = page.locator('#inv-email')
    this.roleSelect = page.locator('#inv-role')
    this.modalSubmitButton = this.modal.getByRole('button', { name: /convidar|enviar/i })
    this.modalError = this.modal.getByText(/preencha todos os campos|erro/i)
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.users)
  }

  async openInviteModal(): Promise<void> {
    await this.inviteButton.click()
    await expect(this.modal).toBeVisible()
  }

  async fillInvite(data: { name: string; email: string; role?: string }): Promise<void> {
    await this.nameInput.fill(data.name)
    await this.emailInput.fill(data.email)
    if (data.role) await this.roleSelect.selectOption(data.role)
  }

  async submitInvite(): Promise<void> {
    await this.modalSubmitButton.click()
  }

  async expectUserVisible(name: string): Promise<void> {
    await expect(this.page.getByText(name)).toBeVisible()
  }

  async expectInviteBlocked(): Promise<void> {
    await expect(this.inviteButton).toHaveCount(0)
  }
}
