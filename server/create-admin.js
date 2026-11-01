import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from './db.js';
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 12) {
    console.error('Définissez ADMIN_EMAIL et ADMIN_PASSWORD (12 caractères minimum) dans .env avant de lancer npm run admin:create.');
    process.exit(1);
}
const hash = await bcrypt.hash(password, 12);
await sql `INSERT INTO admin (email,password_hash) VALUES (${email},${hash}) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash`;
console.log(`Compte administrateur prêt pour ${email}. Le mot de passe n'est pas affiché.`);
