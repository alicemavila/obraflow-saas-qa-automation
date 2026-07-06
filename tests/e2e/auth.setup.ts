import { test as setup } from '@playwright/test'
import { loginAndSaveState, authStatePath } from '../../utils/auth'
import { adminUser, gestorUser, colaboradorUser, clienteUser, superAdminUser } from '../../fixtures/users'

/**
 * Gera um storageState (cookies de sessão do NextAuth) por perfil, uma
 * única vez, para ser reaproveitado pelos projects "authenticated-*" do
 * playwright.config.ts. Isso evita fazer login via UI em todo teste que
 * só precisa de uma sessão pronta (ex: testes de API).
 */
setup('autenticar como admin', async ({ page }) => {
  await loginAndSaveState(page, adminUser, authStatePath('admin'))
})

setup('autenticar como super admin', async ({ page }) => {
  await loginAndSaveState(page, superAdminUser, authStatePath('super-admin'))
})

setup('autenticar como gestor', async ({ page }) => {
  await loginAndSaveState(page, gestorUser, authStatePath('gestor'))
})

setup('autenticar como colaborador', async ({ page }) => {
  await loginAndSaveState(page, colaboradorUser, authStatePath('colaborador'))
})

setup('autenticar como cliente', async ({ page }) => {
  await loginAndSaveState(page, clienteUser, authStatePath('cliente'))
})
