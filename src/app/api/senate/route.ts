import { NextResponse } from "next/server";
import { submitSenate, getSenate } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  if (typeof body.value !== "number") {
    return NextResponse.json({ error: "value (number) required" }, { status: 400 });
  }
  const result = await submitSenate(body.value);
  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json(await getSenate());
}
