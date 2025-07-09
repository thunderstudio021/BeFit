import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const session = await supabase.auth.getSession()
  const pathname = req.nextUrl.pathname

  // Se não estiver logado e estiver tentando acessar uma rota protegida
  const protectedRoutes = ["/", "/admin", "/perfil", "/dashboard"]
  console.log(session);
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  if (!session.data.session && isProtected) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }
  return res
}

export const config = {
  matcher: ['/', '/admin/:path*'], // ajuste conforme necessário
}
