import { env } from '../utils/env'

export interface TestUser {
  email: string
  password: string
  role: 'SUPER_ADMIN' | 'ADMIN_EMPRESA' | 'GESTOR_OBRA' | 'COLABORADOR' | 'CLIENTE_SINDICO' | 'INVALID'
  label: string
}

export const superAdminUser: TestUser = {
  email: env.SUPER_ADMIN_EMAIL,
  password: env.SUPER_ADMIN_PASSWORD,
  role: 'SUPER_ADMIN',
  label: 'Super Admin',
}

export const adminUser: TestUser = {
  email: env.ADMIN_EMAIL,
  password: env.ADMIN_PASSWORD,
  role: 'ADMIN_EMPRESA',
  label: 'Admin Empresa',
}

export const gestorUser: TestUser = {
  email: env.GESTOR_EMAIL,
  password: env.GESTOR_PASSWORD,
  role: 'GESTOR_OBRA',
  label: 'Gestor de Obra',
}

export const colaboradorUser: TestUser = {
  email: env.COLABORADOR_EMAIL,
  password: env.COLABORADOR_PASSWORD,
  role: 'COLABORADOR',
  label: 'Colaborador',
}

export const clienteUser: TestUser = {
  email: env.CLIENTE_EMAIL,
  password: env.CLIENTE_PASSWORD,
  role: 'CLIENTE_SINDICO',
  label: 'Cliente/Síndico',
}

export const invalidUser: TestUser = {
  email: env.INVALID_EMAIL,
  password: env.INVALID_PASSWORD,
  role: 'INVALID',
  label: 'Usuário inválido',
}
