import { expect, type Locator, type Page } from '@playwright/test'

import type { WorksiteData } from '../fixtures/worksites'

export class WorksiteFormPage {
  readonly page: Page

  readonly dialog: Locator
  readonly form: Locator

  readonly simpleRegistrationButton: Locator
  readonly completeRegistrationButton: Locator

  readonly nameInput: Locator
  readonly statusSelect: Locator
  readonly groupSelect: Locator
  readonly hasTaskListCheckbox: Locator

  readonly responsibleNameInput: Locator
  readonly responsibleCreaInput: Locator

  readonly startDateInput: Locator
  readonly endDateForecastInput: Locator

  readonly clientNameInput: Locator
  readonly contractTypeInput: Locator
  readonly contractNumberInput: Locator
  readonly artNumberInput: Locator
  readonly totalAreaInput: Locator

  readonly cepInput: Locator
  readonly addressInput: Locator
  readonly neighborhoodInput: Locator
  readonly cityInput: Locator
  readonly stateInput: Locator

  readonly submitButton: Locator
  readonly closeButton: Locator
  readonly serverError: Locator

  constructor(page: Page) {
    this.page = page

    /*
     * Todos os campos do cadastro de obra ficam dentro do modal
     * acessível chamado "Adicionar obra".
     *
     * Manter os locators limitados ao dialog evita conflitos com
     * filtros e campos existentes na página de listagem.
     */
    this.dialog = page.getByRole('dialog', {
      name: /adicionar obra/i,
    })

    this.form = this.dialog.locator('form')

    this.simpleRegistrationButton = this.dialog.getByRole('button', {
      name: /cadastro simples/i,
    })

    this.completeRegistrationButton = this.dialog.getByRole('button', {
      name: /cadastro completo/i,
    })

    this.nameInput = this.dialog.getByLabel(/^nome da obra$/i)

    /*
     * O id é utilizado para não conflitar com o select
     * "Filtrar por status" existente na listagem.
     */
    this.statusSelect = this.dialog.locator('select#status')
    this.groupSelect = this.dialog.locator('select#groupId')

    this.hasTaskListCheckbox = this.dialog.getByLabel(
      /^habilitar lista de tarefas$/i,
    )

    this.responsibleNameInput = this.dialog.getByLabel(
      /^responsável técnico$/i,
    )

    this.responsibleCreaInput = this.dialog.getByLabel(
      /^crea \/ cau$/i,
    )

    this.startDateInput = this.dialog.getByLabel(/^data de início$/i)

    this.endDateForecastInput = this.dialog.getByLabel(
      /^previsão de término$/i,
    )

    this.clientNameInput = this.dialog.getByLabel(/^contratante$/i)

    this.contractTypeInput = this.dialog.getByLabel(
      /^tipo de contrato$/i,
    )

    this.contractNumberInput = this.dialog.getByLabel(
      /^nº do contrato$/i,
    )

    this.artNumberInput = this.dialog.getByLabel(/^art \/ rrt$/i)

    this.totalAreaInput = this.dialog.getByLabel(
      /^área total \(m²\)$/i,
    )

    this.cepInput = this.dialog.getByLabel(/^cep$/i)
    this.addressInput = this.dialog.getByLabel(/^logradouro$/i)
    this.neighborhoodInput = this.dialog.getByLabel(/^bairro$/i)
    this.cityInput = this.dialog.getByLabel(/^cidade$/i)
    this.stateInput = this.dialog.getByLabel(/^uf$/i)

    this.submitButton = this.dialog.getByRole('button', {
      name: /^salvar obra$/i,
    })

    this.closeButton = this.dialog.getByRole('button', {
      name: /^fechar$/i,
    })

    this.serverError = this.dialog.getByRole('alert').first()
  }

  async expectModalVisible(): Promise<void> {
    await expect(
      this.dialog,
      'O modal "Adicionar obra" deveria estar visível.',
    ).toBeVisible()

    await expect(
      this.form,
      'O formulário de cadastro de obra deveria estar visível.',
    ).toBeVisible()
  }

  /**
   * Seleciona um modo de cadastro somente quando ele ainda não está ativo.
   *
   * Isso impede cliques duplicados quando:
   * 1. o teste seleciona o modo explicitamente; e
   * 2. fillWorksite recebe registrationMode e tenta selecionar novamente.
   */
  private async ensureRegistrationMode(button: Locator): Promise<void> {
    await this.expectModalVisible()

    await expect(
      button,
      'O botão do modo de cadastro deveria estar visível.',
    ).toBeVisible()

    const ariaPressed = await button.getAttribute('aria-pressed')
    const isAlreadySelected = ariaPressed === 'true'

    if (!isAlreadySelected) {
      await button.click()
    }

    await expect(
      button,
      'O modo de cadastro deveria permanecer selecionado.',
    ).toHaveAttribute('aria-pressed', 'true')

    /*
     * Validação defensiva para identificar imediatamente se algum clique
     * fechar o modal indevidamente.
     */
    await this.expectModalVisible()
  }

  async selectSimpleRegistration(): Promise<void> {
    await this.ensureRegistrationMode(
      this.simpleRegistrationButton,
    )
  }

  async selectCompleteRegistration(): Promise<void> {
    await this.ensureRegistrationMode(
      this.completeRegistrationButton,
    )
  }

  async expectRequiredFieldsVisible(): Promise<void> {
    await this.expectModalVisible()

    await expect(this.nameInput).toBeVisible()
    await expect(this.statusSelect).toBeVisible()
    await expect(this.groupSelect).toBeVisible()
  }

  async expectOptionalFieldsVisible(): Promise<void> {
    await this.expectModalVisible()

    await expect(this.responsibleNameInput).toBeVisible()
    await expect(this.responsibleCreaInput).toBeVisible()

    await expect(this.startDateInput).toBeVisible()
    await expect(this.endDateForecastInput).toBeVisible()

    await expect(this.clientNameInput).toBeVisible()
    await expect(this.contractTypeInput).toBeVisible()
    await expect(this.contractNumberInput).toBeVisible()
    await expect(this.artNumberInput).toBeVisible()
    await expect(this.totalAreaInput).toBeVisible()

    await expect(this.cepInput).toBeVisible()
    await expect(this.addressInput).toBeVisible()
    await expect(this.neighborhoodInput).toBeVisible()
    await expect(this.cityInput).toBeVisible()
    await expect(this.stateInput).toBeVisible()
  }

  async selectGroup(groupLabel = 'Geral'): Promise<void> {
    await this.expectModalVisible()

    /*
     * O grupo vem de /api/worksite-groups.
     *
     * Espera o select carregar mais de uma option:
     * - opção vazia: "Selecione um grupo…"
     * - grupo real: normalmente "Geral"
     */
    await expect
      .poll(
        async () => this.groupSelect.locator('option').count(),
        {
          timeout: 15_000,
          message:
            'O select de grupos não carregou nenhum grupo disponível.',
        },
      )
      .toBeGreaterThan(1)

    await this.groupSelect.selectOption({
      label: groupLabel,
    })

    await expect(this.groupSelect).not.toHaveValue('')
  }

  async fillWorksite(
    data: Partial<WorksiteData>,
  ): Promise<void> {
    await this.expectModalVisible()

    if (data.registrationMode === 'COMPLETE') {
      await this.selectCompleteRegistration()
    } else if (data.registrationMode === 'SIMPLE') {
      await this.selectSimpleRegistration()
    }

    /*
     * Confirma novamente que o modal continuou aberto depois da
     * seleção do modo, antes de iniciar o preenchimento.
     */
    await this.expectModalVisible()

    if (data.name) {
      await this.nameInput.fill(data.name)
    }

    if (data.status) {
      await this.statusSelect.selectOption(data.status)
    }

    await this.selectGroup(data.groupLabel ?? 'Geral')

    if (typeof data.hasTaskList === 'boolean') {
      await this.hasTaskListCheckbox.setChecked(
        data.hasTaskList,
      )
    }

    if (data.responsibleName) {
      await this.responsibleNameInput.fill(
        data.responsibleName,
      )
    }

    if (data.responsibleCrea) {
      await this.responsibleCreaInput.fill(
        data.responsibleCrea,
      )
    }

    if (data.startDate) {
      await this.startDateInput.fill(data.startDate)
    }

    if (data.endDateForecast) {
      await this.endDateForecastInput.fill(
        data.endDateForecast,
      )
    }

    if (data.clientName) {
      await this.clientNameInput.fill(data.clientName)
    }

    if (data.contractType) {
      await this.contractTypeInput.fill(
        data.contractType,
      )
    }

    if (data.contractNumber) {
      await this.contractNumberInput.fill(
        data.contractNumber,
      )
    }

    if (data.artNumber) {
      await this.artNumberInput.fill(data.artNumber)
    }

    if (data.totalArea) {
      await this.totalAreaInput.fill(data.totalArea)
    }

    if (data.cep) {
      await this.cepInput.fill(data.cep)
    }

    if (data.address) {
      await this.addressInput.fill(data.address)
    }

    if (data.neighborhood) {
      await this.neighborhoodInput.fill(
        data.neighborhood,
      )
    }

    if (data.city) {
      await this.cityInput.fill(data.city)
    }

    if (data.state) {
      await this.stateInput.fill(data.state)
    }
  }

  async submit(): Promise<void> {
    await this.expectModalVisible()

    await expect(this.submitButton).toBeVisible()
    await expect(this.submitButton).toBeEnabled()

    await this.submitButton.click()
  }

  async close(): Promise<void> {
    await this.expectModalVisible()

    await this.closeButton.click()
    await expect(this.dialog).toBeHidden()
  }

  async expectValidationMessage(
    message: string | RegExp,
  ): Promise<void> {
    await this.expectModalVisible()

    await expect(
      this.dialog.getByText(message).first(),
    ).toBeVisible()
  }

  async expectServerError(
    message: string | RegExp,
  ): Promise<void> {
    await this.expectModalVisible()

    await expect(this.serverError).toBeVisible()
    await expect(this.serverError).toContainText(message)
  }
}