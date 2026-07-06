import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'
import { authStatePath } from './utils/auth'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./utils/global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  projects: [
    // Gera o storageState de cada perfil antes de qualquer outro projeto rodar.
    // fullyParallel: false → roda os 5 logins em SÉRIE (não paralelo), evitando
    // que todos batam ao mesmo tempo em rotas do Next.js dev ainda não
    // compiladas (causa da intermitência).
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      fullyParallel: false,
      timeout: 90_000,
    },

    // E2E "anônimos" (fazem login via UI dentro do próprio teste: auth,
    // fluxos de criação, permissões que dependem de estado inicial).
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testDir: './tests/e2e',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testDir: './tests/e2e',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testDir: './tests/e2e',
    },

    // Testes de API reutilizam o storageState gerado pelo projeto "setup".
    {
      name: 'api',
      use: { storageState: authStatePath('admin') },
      testDir: './tests/api',
      dependencies: ['setup'],
    },
  ],
})