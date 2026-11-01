import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { sql } from './db.js';
import { requireAdmin, signToken } from './auth.js';
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '30kb' }));
const safeUrl = (v) => typeof v === 'string' && /^https?:\/\/\S+$/i.test(v);
const cleanProject = (p) => ({ name: String(p.name ?? '').trim().slice(0, 140), url: String(p.url ?? '').trim(), icon: String(p.icon ?? 'J').trim().slice(0, 8), completed_at: p.completed_at || null, stack: Array.isArray(p.stack) ? p.stack.map((s) => String(s).trim().slice(0, 50)).filter(Boolean).slice(0, 30) : [] });
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.post('/api/admin/login', async (req, res) => {
    try {
        const email = String(req.body?.email ?? '').trim().toLowerCase(), password = String(req.body?.password ?? '');
        if (!email || !password)
            return res.status(400).json({ error: 'E-mail et mot de passe requis.' });
        const rows = await sql `SELECT id,email,password_hash FROM admin WHERE email=${email} LIMIT 1`;
        if (!rows.length || !await bcrypt.compare(password, String(rows[0].password_hash)))
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        return res.json({ token: signToken(Number(rows[0].id)), admin: { email: rows[0].email } });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Erreur serveur. Vérifiez la configuration Neon.' });
    }
});
app.get('/api/projects', async (_req, res) => {
    try {
        const rows = await sql `SELECT id,name,url,icon,completed_at,stack FROM realisation ORDER BY completed_at DESC NULLS LAST,id DESC`;
        res.json(rows.map((r) => ({ ...r, stack: Array.isArray(r.stack) ? r.stack : [] })));
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Impossible de charger les réalisations.' });
    }
});
app.post('/api/projects', requireAdmin, async (req, res) => {
    try {
        const p = cleanProject(req.body);
        if (!p.name || !safeUrl(p.url))
            return res.status(400).json({ error: 'Nom et URL HTTP(S) valides obligatoires.' });
        const rows = await sql `INSERT INTO realisation (name,url,icon,completed_at,stack) VALUES (${p.name},${p.url},${p.icon},${p.completed_at},${JSON.stringify(p.stack)}::jsonb) RETURNING id,name,url,icon,completed_at,stack`;
        res.status(201).json(rows[0]);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Création impossible.' });
    }
});
app.put('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id), p = cleanProject(req.body);
        if (!Number.isInteger(id) || id < 1)
            return res.status(400).json({ error: 'Identifiant invalide.' });
        if (!p.name || !safeUrl(p.url))
            return res.status(400).json({ error: 'Nom et URL HTTP(S) valides obligatoires.' });
        const rows = await sql `UPDATE realisation SET name=${p.name},url=${p.url},icon=${p.icon},completed_at=${p.completed_at},stack=${JSON.stringify(p.stack)}::jsonb WHERE id=${id} RETURNING id,name,url,icon,completed_at,stack`;
        if (!rows.length)
            return res.status(404).json({ error: 'Réalisation introuvable.' });
        res.json(rows[0]);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Modification impossible.' });
    }
});
app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1)
            return res.status(400).json({ error: 'Identifiant invalide.' });
        const rows = await sql `DELETE FROM realisation WHERE id=${id} RETURNING id`;
        if (!rows.length)
            return res.status(404).json({ error: 'Réalisation introuvable.' });
        res.status(204).end();
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Suppression impossible.' });
    }
});
const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`API portfolio prête sur http://localhost:${port}`));
