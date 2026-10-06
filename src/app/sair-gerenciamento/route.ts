import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/cerimonialista", req.url));
  response.cookies.set("cerim_managing", "", { maxAge: 0, path: "/" });
  return response;
}
