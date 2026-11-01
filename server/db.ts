import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL est manquant. Configurez votre base Neon dans .env.')
export const sql = neon(process.env.DATABASE_URL)
