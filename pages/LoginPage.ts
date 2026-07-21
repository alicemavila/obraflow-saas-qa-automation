import { expect, type Locator, type Page } from '@playwright/test'

import { routes } from '../utils/routes'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator
  readonly forgotPasswordLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('E-mail', { exact: true })
    this.passwordInput = page.getByLabel('Senha', { exact: true })
    this.submitButton = page.getByRole('button', { name: /^Entrar$/i })
    this.errorMessage = page
      .getByText(/e-mail ou senha incorretos|credenciais inválidas|inválid/i)
      .first()
    this.forgotPasswordLink = page.getByRole('link', {
      name: /esqueceu a senha/i,
    })
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.login)
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async loginAndWaitForRedirect(
    email: string,
    password: string,
  ): Promise<void> {
    await this.login(email, password)

    await this.page.waitForURL(
      (url) => !url.pathname.startsWith(routes.login),
      { timeout: 45_000 },
    )

    await expect(this.page).not.toHaveURL(new RegExp(routes.login))
  }

  async expectLoginPageLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  async expectInvalidCredentialsMessage(): Promise<void> {
    await expect(this.errorMessage).toBeVisible()
  }

  /**
   * O formulário usa validação client-side, então os erros aparecem como
   * texto abaixo dos campos, não como validação nativa do navegador.
   */
  async expectRequiredFieldsValidation(): Promise<void> {
    await this.submitButton.click()

    await expect(
      this.page.locator('text=/obrigatório|inválido|obrigatória/i').first(),
    ).toBeVisible()
  }
}