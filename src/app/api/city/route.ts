import { NextResponse } from "next/server";
import { incrementCityTaps, getCityTaps } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const amount = typeof body.amount === "number" ? body.amount : 1;
  const total = await incrementCityTaps(amount);
  return NextResponse.json({ cityTaps: total });
}

export async function GET() {
  return NextResponse.json({ cityTaps: await getCityTaps() });
}
