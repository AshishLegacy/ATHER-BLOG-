import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { UserRole } from "@/types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user?.email) {
      const email = data.user.email;
      const name =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        email.split("@")[0];
      const image =
        data.user.user_metadata?.avatar_url ||
        data.user.user_metadata?.picture ||
        null;

      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name,
            image,
            role: "AUTHOR",
          },
        });
      } else if (user.isBanned) {
        return NextResponse.redirect(`${origin}/login?error=suspended`);
      }

      const sessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role as UserRole,
      };

      const token = await createSessionToken(sessionUser);
      await setSessionCookie(token);

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
