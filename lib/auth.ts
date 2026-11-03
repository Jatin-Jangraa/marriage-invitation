import { SignJWT,jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest,NextResponse } from 'next/server';
const secret=()=>new TextEncoder().encode(process.env.AUTH_SECRET||'');
const COOKIE='vivaha_admin';
export async function createSession(email:string){if(!process.env.AUTH_SECRET||process.env.AUTH_SECRET.length<32)throw new Error('AUTH_SECRET must contain at least 32 characters');const token=await new SignJWT({email,role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret());(await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800})}
export async function adminSession(){try{const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret());return payload.role==='admin'?payload:null}catch{return null}}
export async function requireAdmin(request?:NextRequest){try{const token=request?.cookies.get(COOKIE)?.value??(await cookies()).get(COOKIE)?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret());return payload.role==='admin'?payload:null}catch{return null}}
export function unauthorized(){return NextResponse.json({error:'Unauthorized'},{status:401})}
