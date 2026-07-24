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
  readonly addWorksiteDialog: Locator

  readonly emptyState: Locator

  constructor(page: Page) {
    this.page = page

    this.heading = page.getByRole('heading', {
      name: /^obras$/i,
    })

    /*
     * Botão amarelo "+ ADICIONAR" presente no cabeçalho
     * das páginas autenticadas.
     */
    this.addMenuButton = page
      .getByRole('button', {
        name: /adicionar novo item|adicionar/i,
      })
      .first()

    /*
     * Aceita as diferentes implementações acessíveis que o item
     * pode possuir: menuitem, button ou texto.
     */
    this.addWorksiteMenuItem = page
      .getByRole('menuitem', {
        name: /adicionar obra/i,
      })
      .or(
        page.getByRole('button', {
          name: /adicionar obra/i,
        }),
      )
      .or(page.getByText(/^adicionar obra$/i))
      .first()

    this.addWorksiteDialog = page.getByRole('dialog', {
      name: /adicionar obra/i,
    })

    this.emptyState = page.getByText(
      /nenhuma obra cadastrada/i,
    )
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.worksites)

    await this.page.waitForLoadState('domcontentloaded')
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(routes.worksites),
    )

    await expect(
      this.heading,
      'A página de obras deveria estar carregada.',
    ).toBeVisible()
  }

  async openAddWorksite(): Promise<void> {
    await this.expectLoaded()

    await expect(
      this.addMenuButton,
      'O botão "Adicionar" deveria estar visível.',
    ).toBeVisible()

    await expect(this.addMenuButton).toBeEnabled()

    await this.addMenuButton.click()

    await expect(
      this.addWorksiteMenuItem,
      'A opção "Adicionar obra" deveria aparecer no menu.',
    ).toBeVisible()

    await this.addWorksiteMenuItem.click()

    /*
     * Não valida apenas o heading, pois ele poderia existir em um
     * elemento oculto. A validação principal é feita sobre o dialog.
     */
    await expect(
      this.addWorksiteDialog,
      'O modal "Adicionar obra" deveria abrir após o clique.',
    ).toBeVisible()

    await expect(
      this.addWorksiteDialog.locator('form'),
      'O formulário de cadastro deveria estar dentro do modal.',
    ).toBeVisible()
  }

  worksiteCard(name: string): Locator {
    return this.page
      .locator('a')
      .filter({
        hasText: new RegExp(escapeRegExp(name), 'i'),
      })
      .first()
  }

  async expectWorksiteVisible(
    name: string,
  ): Promise<void> {
    await expect(
      this.page.getByText(name).first(),
    ).toBeVisible()
  }

  async expectStatusVisible(
    name: string,
    statusLabel: string,
  ): Promise<void> {
    const card = this.worksiteCard(name)

    if ((await card.count()) > 0) {
      await expect(card).toContainText(statusLabel)
      return
    }

    await expect(
      this.page.getByText(statusLabel).first(),
    ).toBeVisible()
  }

  async expectAddButtonHidden(): Promise<void> {
    await expect(this.addMenuButton).toHaveCount(0)
  }
}