import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register'
  
  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
