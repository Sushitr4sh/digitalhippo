import { NextRequest, NextResponse } from "next/server";
import { getServerSideUser } from "./lib/payload-utils";

// https://nextjs.org/docs/app/building-your-application/routing/middleware
export async function middleware(req: NextRequest) {
  // If user is logged in, they shouldn't be able to access sign-in/sign-up page
  const { nextUrl, cookies } = req;
  const { user } = await getServerSideUser(cookies);

  if (user && ["/sign-in", "/sign-up"].includes(nextUrl.pathname)) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);
  }

  return NextResponse.next();
}
