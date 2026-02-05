import { NextResponse } from "next/server";
import { incrementActiveUsers, getActiveUsers } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST() {
  const count = await incrementActiveUsers();
  return NextResponse.json({ activeUsers: count });
}

export async function GET() {
  const count = await getActiveUsers();
  return NextResponse.json({ activeUsers: count });
}
