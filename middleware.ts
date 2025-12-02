import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard and doctor routes
  if ((request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/doctor')) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if ((request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/register')) && user) {
    // We can't easily check the role here without a DB call which is expensive in middleware.
    // However, we can check if they have a doctor specific cookie or just default to dashboard
    // and let the dashboard redirect them if needed. 
    // OR, we can just let them go to dashboard and if they are a doctor, the sidebar link will take them to portal.
    // BUT, the user asked for "same doctor portal display on login page".
    // Let's rely on the client-side redirect from the login page for the initial flow.
    // For returning users, we might want to be smarter.

    // Ideally we would store the role in the session metadata or a cookie.
    // For now, let's keep it simple: redirect to /dashboard. 
    // If they are a doctor, they can click "Doctor Portal".
    // Wait, the user said "doctor can directly access... by any authentication".

    // Let's try to fetch the profile role from the DB in middleware? No, that's bad practice usually.
    // Better approach: The login page handles the initial redirect.
    // If they are already logged in and hit /auth/login, we send them to /dashboard.
    // From /dashboard, if they are a doctor, they see the link.
    // This seems acceptable for now unless we want to add a custom claim to the JWT.

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

