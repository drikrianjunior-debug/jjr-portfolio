import 'dotenv/config'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
export type AuthRequest = Request & { adminId?: number }
const secret = process.env.JWT_SECRET
if (!secret || secret.length < 32) throw new Error('JWT_SECRET doit contenir au moins 32 caractères.')
export function signToken(id:number) { return jwt.sign({adminId:id},secret!,{expiresIn:'8h'}) }
export function requireAdmin(req:AuthRequest,res:Response,next:NextFunction) {
  const value=req.headers.authorization
  if(!value?.startsWith('Bearer ')) return res.status(401).json({error:'Connexion administrateur requise.'})
  try { const payload=jwt.verify(value.slice(7),secret!) as {adminId:number}; req.adminId=payload.adminId; next() }
  catch { return res.status(401).json({error:'Session expirée. Reconnectez-vous.'}) }
}
