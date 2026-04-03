import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const paid = req.cookies.get("fridgeflow_paid")?.value;
  if (paid !== "true") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
