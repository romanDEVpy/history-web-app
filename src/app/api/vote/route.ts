import { NextResponse } from "next/server";
import { voteBeard, getBeardVotes } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  if (typeof body.yes !== "boolean") {
    return NextResponse.json({ error: "Field 'yes' (boolean) required" }, { status: 400 });
  }
  const votes = await voteBeard(body.yes);
  return NextResponse.json(votes);
}

export async function GET() {
  const votes = await getBeardVotes();
  return NextResponse.json(votes);
}
