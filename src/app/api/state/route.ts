import { NextResponse } from "next/server";
import { getFullState, setCurrentSlide, resetSession } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = await getFullState();
  return NextResponse.json(state);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.action === "set_slide" && typeof body.slide === "number") {
    await setCurrentSlide(body.slide);
    const state = await getFullState();
    return NextResponse.json(state);
  }

  if (body.action === "reset") {
    await resetSession();
    const state = await getFullState();
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
