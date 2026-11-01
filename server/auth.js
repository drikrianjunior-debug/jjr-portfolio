import 'dotenv/config';
import jwt from 'jsonwebtoken';
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32)
    throw new Error('JWT_SECRET doit contenir au moins 32 caractères.');
export function signToken(id) { return jwt.sign({ adminId: id }, secret, { expiresIn: '8h' }); }
export function requireAdmin(req, res, next) {
    const value = req.headers.authorization;
    if (!value?.startsWith('Bearer '))
        return res.status(401).json({ error: 'Connexion administrateur requise.' });
    try {
        const payload = jwt.verify(value.slice(7), secret);
        req.adminId = payload.adminId;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' });
    }
}
