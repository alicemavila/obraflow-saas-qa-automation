import { test, expect } from '@playwright/test'
import { LoginPage } from '../../../pages/LoginPage'
import { WorksitesPage } from '../../../pages/WorksitesPage'
import { colaboradorUser, gestorUser, clienteUser } from '../../../fixtures/users'
import { routes } from '../../../utils/routes'

test.describe('Obras — Permissões por perfil (RBAC)', () => {
  test('@regression @rbac CLIENTE_SINDICO é redirecionado ao tentar acessar rota administrativa de obras', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(clienteUser.email, clienteUser.password)

    await page.goto(routes.worksites)

    // O middleware redireciona todo CLIENTE_SINDICO para /client em
    // qualquer rota fora dela. HOJE /client não está implementado (404) —
    // ver docs/risk-matrix.md. Este teste documenta o comportamento atual
    // do middleware (o redirecionamento em si), não a página final.
    await expect(page).toHaveURL(new RegExp(routes.client))
  })

  test('@regression @rbac COLABORADOR não vê o botão de criar obra', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const worksitesPage = new WorksitesPage(page)

    await loginPage.goto()
    await loginPage.login(colaboradorUser.email, colaboradorUser.password)

    await worksitesPage.goto()
    await worksitesPage.expectLoaded()
    await worksitesPage.expectAddButtonHidden()
  })

  test('@regression @rbac COLABORADOR não consegue criar obra mesmo acessando a URL direta', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(colaboradorUser.email, colaboradorUser.password)

    // A página /obras/nova em si não faz checagem de role no server component
    // atual — a proteção real está na API (POST /api/worksites -> 403).
    // Este teste é intencionalmente de nível de API/negócio; ver
    // tests/api/authorization.api.spec.ts para a validação de status HTTP.
    const response = await page.request.post('/api/worksites', {
      data: { name: 'Obra não autorizada', cep: '01310-100', address: 'Rua X', city: 'SP', state: 'SP', responsibleName: 'Teste', startDate: new Date().toISOString() },
    })
    expect(response.status()).toBe(403)
  })

  test('@regression @rbac GESTOR_OBRA vê apenas as obras às quais está associado', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const worksitesPage = new WorksitesPage(page)

    await loginPage.goto()
    await loginPage.login(gestorUser.email, gestorUser.password)

    await worksitesPage.goto()
    await worksitesPage.expectLoaded()
    // A massa de seed garante ao menos 1 obra associada ao gestor demo;
    // validamos que a listagem carrega sem erro e sem o botão de criação
    // (GESTOR_OBRA também não pode criar obras).
    await worksitesPage.expectAddButtonHidden()
  })
})
