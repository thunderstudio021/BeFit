import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session
  const pathname = req.nextUrl.pathname

  const protectedRoutes = ["/", "/admin", "/perfil", "/dashboard"]
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

  // Se não estiver logado e acessar rota protegida, redireciona pra /auth
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  // Se estiver logado e em rota protegida, verifica user_type
  if (session && isProtected) {
    // Busca o perfil do usuário
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single()

    if (error || !profile) {
      // Se erro ou perfil não encontrado, desloga (vai pra /auth)
      return NextResponse.redirect(new URL("/auth", req.url))
    }

    // Se user_type não for admin ou producer, bloqueia acesso às rotas admin, dashboard, etc
    if (["/admin"].some(route => pathname.startsWith(route)) && 
        profile.user_type !== "admin" && profile.user_type !== "producer") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // Se user_type não for admin ou producer, bloqueia acesso às rotas admin, dashboard, etc
    if (["/planner", "/fitz", "/store", "/premium"].some(route => pathname.startsWith(route)) && 
        profile.user_type !== "admin" && profile.user_type !== "producer" && profile.user_type !== "premium") {
      return NextResponse.redirect(new URL("/premium/subscribe", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/', '/admin/:path*', '/planner/:path*','/premium','/fitz/:path*','/store/:path*', '/dashboard/:path*'], // rotas protegidas
}