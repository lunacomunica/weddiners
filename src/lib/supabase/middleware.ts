import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DASHBOARD_ROUTES = ["/dashboard", "/site", "/presentes", "/convidados", "/configuracoes", "/planos", "/fornecedores", "/mesas", "/pagamentos", "/planejamento", "/recados", "/referencias"];
const AUTH_ROUTES = ["/login", "/cadastro", "/reset-senha"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = DASHBOARD_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"));
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

  // Rotas públicas não precisam verificar auth — evita timeout do middleware
  if (!isDashboardRoute && !isAuthRoute) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
