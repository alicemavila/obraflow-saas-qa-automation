import { expect, type Page, type Locator } from '@playwright/test'
import type { WorksiteData } from '../fixtures/worksites'

/**
 * O ObraFlow tem um único formulário de obra (sem alternância entre modo
 * "simples" e "completo"). Este Page Object preenche os campos que
 * estiverem presentes no objeto de dados recebido — os demais ficam vazios,
 * exercitando a validação de obrigatoriedade normalmente.
 */
export class WorksiteFormPage {
  readonly page: Page
  readonly nameInput: Locator
  readonly clientNameInput: Locator
  readonly contractNumberInput: Locator
  readonly cepInput: Locator
  readonly addressInput: Locator
  readonly neighborhoodInput: Locator
  readonly cityInput: Locator
  readonly stateInput: Locator
  readonly responsibleNameInput: Locator
  readonly responsibleCreaInput: Locator
  readonly artNumberInput: Locator
  readonly totalAreaInput: Locator
  readonly startDateInput: Locator
  readonly endDateForecastInput: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly serverError: Locator

  constructor(page: Page) {
    this.page = page
    this.nameInput = page.getByLabel('Nome / Identificação da obra *')
    this.clientNameInput = page.getByLabel('Nome do cliente / condomínio')
    this.contractNumberInput = page.getByLabel('Número do contrato')
    this.cepInput = page.getByLabel('CEP *')
    this.addressInput = page.getByLabel('Logradouro *')
    this.neighborhoodInput = page.getByLabel('Bairro')
    this.cityInput = page.getByLabel('Cidade *')
    this.stateInput = page.getByLabel('UF *')
    this.responsibleNameInput = page.getByLabel('Nome do responsável *')
    this.responsibleCreaInput = page.getByLabel('CREA / CAU')
    this.artNumberInput = page.getByLabel('Número da ART / RRT')
    this.totalAreaInput = page.getByLabel('Área total (m²)')
    this.startDateInput = page.getByLabel('Data de início *')
    this.endDateForecastInput = page.getByLabel('Previsão de conclusão')
    this.submitButton = page.getByRole('button', { name: /criar obra/i })
    this.cancelButton = page.getByRole('button', { name: 'Cancelar' })
    this.serverError = page.getByRole('alert')
  }

  async fillWorksite(data: Partial<WorksiteData>): Promise<void> {
    if (data.name) await this.nameInput.fill(data.name)
    if (data.clientName) await this.clientNameInput.fill(data.clientName)
    if (data.contractNumber) await this.contractNumberInput.fill(data.contractNumber)
    if (data.cep) await this.cepInput.fill(data.cep)
    if (data.address) await this.addressInput.fill(data.address)
    if (data.neighborhood) await this.neighborhoodInput.fill(data.neighborhood)
    if (data.city) await this.cityInput.fill(data.city)
    if (data.state) await this.stateInput.fill(data.state)
    if (data.responsibleName) await this.responsibleNameInput.fill(data.responsibleName)
    if (data.responsibleCrea) await this.responsibleCreaInput.fill(data.responsibleCrea)
    if (data.artNumber) await this.artNumberInput.fill(data.artNumber)
    if (data.totalArea) await this.totalAreaInput.fill(data.totalArea)
    if (data.startDate) await this.startDateInput.fill(data.startDate)
    if (data.endDateForecast) await this.endDateForecastInput.fill(data.endDateForecast)
    // Nota: o campo "description" existe no schema/banco, mas não é exposto
    // na UI atual do formulário — por isso não é preenchido aqui.
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async expectRequiredFieldsVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible()
    await expect(this.cepInput).toBeVisible()
    await expect(this.addressInput).toBeVisible()
    await expect(this.cityInput).toBeVisible()
    await expect(this.stateInput).toBeVisible()
    await expect(this.responsibleNameInput).toBeVisible()
    await expect(this.startDateInput).toBeVisible()
  }

  async expectOptionalFieldsVisible(): Promise<void> {
    await expect(this.clientNameInput).toBeVisible()
    await expect(this.contractNumberInput).toBeVisible()
    await expect(this.responsibleCreaInput).toBeVisible()
    await expect(this.artNumberInput).toBeVisible()
    await expect(this.totalAreaInput).toBeVisible()
    await expect(this.endDateForecastInput).toBeVisible()
  }

  async expectValidationMessage(message: string | RegExp): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible()
  }

  async expectServerError(message: string | RegExp): Promise<void> {
    await expect(this.serverError).toBeVisible()
    await expect(this.serverError).toContainText(message)
  }
}
