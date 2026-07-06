import 'dotenv/config'

const REQUIRED_VARS = [
  'BASE_URL',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'SUPER_ADMIN_EMAIL',
  'SUPER_ADMIN_PASSWORD',
  'GESTOR_EMAIL',
  'GESTOR_PASSWORD',
  'COLABORADOR_EMAIL',
  'COLABORADOR_PASSWORD',
  'CLIENTE_EMAIL',
  'CLIENTE_PASSWORD',
  'INVALID_EMAIL',
  'INVALID_PASSWORD',
] as const

type RequiredVar = (typeof REQUIRED_VARS)[number]

function readEnv(): Record<RequiredVar, string> {
  const missing: string[] = []
  const result = {} as Record<RequiredVar, string>

  for (const key of REQUIRED_VARS) {
    const value = process.env[key]
    if (!value) {
      missing.push(key)
    } else {
      result[key] = value
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[env.ts] Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}.\n` +
      `Copie ".env.example" para ".env" e preencha os valores antes de rodar os testes.`
    )
  }

  return result
}

export const env = readEnv()
