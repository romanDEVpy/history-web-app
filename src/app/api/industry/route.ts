import { NextResponse } from "next/server";
import { submitIndustry, getIndustryResults } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  if (typeof body.option !== "number") {
    return NextResponse.json({ error: "option (number 0-3) required" }, { status: 400 });
  }
  const result = await submitIndustry(body.option);
  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json(await getIndustryResults());
}
