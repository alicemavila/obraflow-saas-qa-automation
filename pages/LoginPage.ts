import { expect, type Page, type Locator } from '@playwright/test'
import { routes } from '../utils/routes'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorAlert: Locator
  readonly forgotPasswordLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('E-mail', { exact: true })
    this.passwordInput = page.getByLabel('Senha', { exact: true })
    this.submitButton = page.getByRole('button', { name: 'Entrar' })
    this.errorAlert = page.getByRole('alert')
    this.forgotPasswordLink = page.getByRole('link', { name: 'Esqueceu a senha?' })
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.login)
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectLoginPageLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  async expectInvalidCredentialsMessage(): Promise<void> {
    await expect(this.errorAlert).toBeVisible()
    await expect(this.errorAlert).toContainText(/e-mail ou senha incorretos/i)
  }

  /**
   * O formulário usa validação client-side (react-hook-form + zod) e
   * `noValidate`, então os erros aparecem como texto abaixo dos campos,
   * não como validação nativa do navegador.
   */
  async expectRequiredFieldsValidation(): Promise<void> {
    await this.submitButton.click()
    await expect(this.page.locator('text=/obrigatório|inválido/i').first()).toBeVisible()
  }
}
