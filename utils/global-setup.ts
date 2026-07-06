import 'dotenv/config'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

/**
 * Roda UMA VEZ, antes de qualquer worker/teste iniciar.
 *
 * Em modo dev, o Next.js compila cada rota sob demanda na primeira
 * requisição. Se vários testes em paralelo (ex: os 5 logins do
 * auth.setup.ts) batem ao mesmo tempo em rotas ainda não compiladas,
 * viram uma "corrida": quem chega primeiro espera o build inteiro,
 * os demais competem por CPU e estouram timeout — daí os resultados
 * intermitentes (às vezes 4 passam, às vezes só 1).
 *
 * Fazendo essas requisições AQUI, em série, uma única vez, garantimos que
 * as rotas já estão compiladas/em cache quando os testes de verdade
 * começarem a rodar em paralelo.
 */
async function warmUp(path: string): Promise<void> {
  const url = `${BASE_URL}${path}`
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(60_000) })
    console.log(`[global-setup] Aquecido ${path} → ${response.status}`)
  } catch (error) {
    console.warn(`[global-setup] Falha ao aquecer ${path} (seguindo mesmo assim):`, error)
  }
}

export default async function globalSetup(): Promise<void> {
  console.log(`[global-setup] Aquecendo rotas em ${BASE_URL} antes dos testes...`)
  await warmUp('/login')
  await warmUp('/dashboard')
  await warmUp('/api/health')
  console.log('[global-setup] Concluído.')
}