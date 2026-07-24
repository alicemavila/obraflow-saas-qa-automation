import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'
import { authStatePath } from './utils/auth'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests',

  /**
   * Verifica se a aplicação está disponível antes de iniciar os testes.
   */
  globalSetup: require.resolve('./utils/global-setup'),

  /**
   * Durante a estabilização, os testes devem executar em série.
   *
   * Isso reduz:
   * - concorrência no banco;
   * - conflito entre massas;
   * - sobrecarga do Next.js em modo dev;
   * - falhas intermitentes.
   */
  fullyParallel: false,

  forbidOnly: Boolean(process.env.CI),

  retries: process.env.CI ? 2 : 0,

  /**
   * Localmente e no CI, começamos com apenas um worker.
   * Poderá ser aumentado depois que a suíte estiver estável.
   */
  workers: 1,

  timeout: 60_000,

  expect: {
    timeout: 15_000,
  },

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
    /**
     * Gera os arquivos de storageState dos perfis:
     *
     * - admin;
     * - super-admin;
     * - gestor;
     * - colaborador;
     * - cliente.
     *
     * Os logins executam em série para evitar concorrência
     * durante a compilação das rotas no Next.js local.
     */
    {
      name: 'setup',
      testDir: './tests/e2e',
      testMatch: /auth\.setup\.ts/,
      fullyParallel: false,
      timeout: 90_000,
    },

    /**
     * Testes E2E executados no Chromium.
     *
     * Dependem do setup porque alguns cenários utilizam
     * storageState de perfis previamente autenticados.
     */
    {
      name: 'chromium',
      testDir: './tests/e2e',

      /**
       * Impede que auth.setup.ts seja executado novamente
       * como um teste E2E comum.
       */
      testIgnore: /auth\.setup\.ts/,

      dependencies: ['setup'],

      use: {
        ...devices['Desktop Chrome'],
      },
    },

    /**
     * Firefox permanece configurado, mas não deve ser usado
     * durante a fase inicial de estabilização.
     */
    {
      name: 'firefox',
      testDir: './tests/e2e',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['setup'],

      use: {
        ...devices['Desktop Firefox'],
      },
    },

    /**
     * WebKit permanece configurado, mas não deve ser usado
     * durante a fase inicial de estabilização.
     */
    {
      name: 'webkit',
      testDir: './tests/e2e',
      testIgnore: /auth\.setup\.ts/,
      dependencies: ['setup'],

      use: {
        ...devices['Desktop Safari'],
      },
    },

    /**
     * API sem autenticação.
     *
     * Executa exclusivamente auth.api.spec.ts.
     *
     * Não depende do projeto setup e não carrega nenhum
     * storageState, garantindo requisições realmente anônimas.
     */
    {
      name: 'api-anonymous',
      testDir: './tests/api',
      testMatch: /auth\.api\.spec\.ts/,
      fullyParallel: false,

      use: {
        storageState: {
          cookies: [],
          origins: [],
        },
      },
    },

    /**
     * API autenticada.
     *
     * Executa os demais arquivos da pasta tests/api e utiliza
     * por padrão a sessão do ADMIN_EMPRESA.
     *
     * Arquivos que testam outros perfis podem sobrescrever o
     * storageState usando test.use().
     */
    {
      name: 'api',
      testDir: './tests/api',

      /**
       * auth.api.spec.ts pertence exclusivamente ao projeto
       * api-anonymous.
       */
      testIgnore: /auth\.api\.spec\.ts/,

      dependencies: ['setup'],
      fullyParallel: false,

      use: {
        storageState: authStatePath('admin'),
      },
    },
  ],
})