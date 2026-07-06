import { expect, type Page } from '@playwright/test'
import { routes } from '../utils/routes'

/**
 * ⚠️ GAP CONHECIDO: o Portal Cliente/Síndico (/client) ainda NÃO foi
 * implementado no ObraFlow. O middleware já redireciona usuários
 * CLIENTE_SINDICO para essa rota em qualquer navegação, mas a página em si
 * não existe — o resultado atual é 404.
 *
 * Este Page Object documenta o comportamento ESPERADO (uma vez que a
 * feature exista) para que os testes em tests/e2e/client/client-area.spec.ts
 * fiquem prontos para "destravar" (via test.fixme) assim que a página for
 * implementada, sem precisar reescrever a suíte do zero.
 */
export class ClientAreaPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(routes.client))
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible()
  }

  async expectAdminMenuNotVisible(): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'Usuários' })).toHaveCount(0)
    await expect(this.page.getByRole('link', { name: 'Empresa' })).toHaveCount(0)
  }

  async expectOnlyAuthorizedWorksitesVisible(): Promise<void> {
    // A implementar quando a página existir: comparar a lista renderizada
    // com as obras associadas ao usuário via WorksiteUser.
    throw new Error('ClientAreaPage ainda não implementado — ver docs/risk-matrix.md')
  }
}
