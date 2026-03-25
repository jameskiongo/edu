import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `https://sandbox.mockerito.com/education/api/courses`,
  );
  const data = await res.json();
  return NextResponse.json(data);
}
