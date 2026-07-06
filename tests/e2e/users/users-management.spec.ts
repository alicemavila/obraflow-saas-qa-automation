import { test, expect } from '@playwright/test'
import { LoginPage } from '../../../pages/LoginPage'
import { UsersPage } from '../../../pages/UsersPage'
import { adminUser, colaboradorUser, clienteUser } from '../../../fixtures/users'
import { uniqueSuffix } from '../../../utils/test-data'
import { routes } from '../../../utils/routes'

/**
 * Nota de adaptação: o ObraFlow usa convite por e-mail (nome + e-mail +
 * perfil) — não existe criação de usuário com senha definida pelo admin.
 * O envio real de e-mail depende do Resend estar configurado; os testes
 * abaixo validam a UI e o estado local após o convite, não a entrega do
 * e-mail em si.
 */
test.describe('Usuários — Gestão (convite)', () => {
  test('@regression @users ADMIN_EMPRESA acessa a listagem de usuários', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const usersPage = new UsersPage(page)

    await loginPage.goto()
    await loginPage.login(adminUser.email, adminUser.password)

    await usersPage.goto()
    await expect(usersPage.heading).toBeVisible()
  })

  test('@regression @users convida um novo usuário com sucesso', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const usersPage = new UsersPage(page)
    const suffix = uniqueSuffix()
    const name = `QA Automação ${suffix}`
    const email = `qa.automacao.${suffix}@teste-obraflow.com`

    await loginPage.goto()
    await loginPage.login(adminUser.email, adminUser.password)

    await usersPage.goto()
    await usersPage.openInviteModal()
    await usersPage.fillInvite({ name, email, role: 'COLABORADOR' })
    await usersPage.submitInvite()

    await usersPage.expectUserVisible(name)
  })

  test('@regression @users valida campos obrigatórios ao convidar sem preencher nada', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const usersPage = new UsersPage(page)

    await loginPage.goto()
    await loginPage.login(adminUser.email, adminUser.password)

    await usersPage.goto()
    await usersPage.openInviteModal()
    await usersPage.submitInvite()

    await expect(usersPage.modalError).toBeVisible()
  })

  test('@regression @users CLIENTE_SINDICO é redirecionado ao tentar acessar usuários', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(clienteUser.email, clienteUser.password)

    await page.goto(routes.users)
    // Redirecionado pelo middleware para /client (ver nota em worksite-permissions.spec.ts)
    await expect(page).toHaveURL(new RegExp(routes.client))
  })

  test('@regression @users COLABORADOR é redirecionado ao tentar acessar usuários', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(colaboradorUser.email, colaboradorUser.password)

    await page.goto(routes.users)
    // Proteção é feita no server component da página (redirect('/dashboard'))
    await expect(page).toHaveURL(new RegExp(routes.dashboard))
  })
})
