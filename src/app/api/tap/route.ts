import { NextResponse } from "next/server";
import { incrementShipTaps, getShipTaps } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const amount = typeof body.amount === "number" ? body.amount : 1;
  const total = await incrementShipTaps(amount);
  return NextResponse.json({ shipTaps: total });
}

export async function GET() {
  const total = await getShipTaps();
  return NextResponse.json({ shipTaps: total });
}
