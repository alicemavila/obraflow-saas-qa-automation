import { test, expect } from '@playwright/test'
import { LoginPage } from '../../../pages/LoginPage'
import { WorksitesPage } from '../../../pages/WorksitesPage'
import { WorksiteFormPage } from '../../../pages/WorksiteFormPage'
import { adminUser } from '../../../fixtures/users'
import { generateMinimalWorksite } from '../../../fixtures/worksites'
import { routes } from '../../../utils/routes'

/**
 * Nota de adaptação: o ObraFlow não tem um modo de "cadastro simples"
 * distinto do "completo" — é um único formulário. Este arquivo cobre o
 * cenário de preencher SOMENTE os campos obrigatórios, e a validação deles.
 */
test.describe('Obras — Cadastro (somente campos obrigatórios)', () => {
  test.beforeEach(async ({ page }) => {
    // Faz login e aguarda o redirecionamento pós-autenticação antes de
    // prosseguir — sem isso, a sessão ainda não está estabelecida quando
    // o teste navega para /obras e o sistema redireciona de volta ao login.
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(adminUser.email, adminUser.password)
    await page.waitForURL(
      (url) => !url.pathname.startsWith(routes.login),
      { timeout: 45_000 },
    )
    // Garante que o dashboard carregou antes de navegar para obras
    await expect(page).not.toHaveURL(new RegExp(routes.login))
  })

  test('@smoke @worksites cria obra preenchendo apenas os campos obrigatórios', async ({ page }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)
    const data = generateMinimalWorksite()

    await worksitesPage.goto()

    // Aguarda a página de obras carregar de fato (não o login)
    await expect(page).not.toHaveURL(new RegExp(routes.login))
    await worksitesPage.openAddWorksite()
    await form.expectRequiredFieldsVisible()

    await form.fillWorksite(data)
    await form.submit()

    // Após criar, a UI redireciona para /obras/:id (UUID v4 ou cuid)
    await page.waitForURL(/\/obras\/[\w-]{20,}$/, { timeout: 30_000 })

    // Confirma na listagem
    await worksitesPage.goto()
    await worksitesPage.expectWorksiteVisible(data.name)
    await worksitesPage.expectStatusVisible(data.name, 'Planejamento')
  })

  test('@regression @worksites valida obrigatoriedade de Nome, CEP, Cidade, UF e Responsável', async ({ page }) => {
    const worksitesPage = new WorksitesPage(page)
    const form = new WorksiteFormPage(page)

    await worksitesPage.goto()
    await worksitesPage.openAddWorksite()

    await form.submit()

    await form.expectValidationMessage(/nome deve ter ao menos/i)
    await form.expectValidationMessage(/endereço obrigatório/i)
    await form.expectValidationMessage(/cidade obrigatória/i)
    await form.expectValidationMessage(/estado deve ter 2 caracteres/i)
    await form.expectValidationMessage(/cep inválido/i)
    await form.expectValidationMessage(/responsável técnico obrigatório/i)
  })
})
