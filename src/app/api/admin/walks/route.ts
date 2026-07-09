import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const walks = await db.fieldWalk.findMany({
      orderBy: { date: "desc" },
      include: { specimens: true },
    });
    return NextResponse.json(walks);
  } catch (err: any) {
    console.error("GET Walks Error:", err);
    return NextResponse.json({ error: "Failed to fetch walks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { routeName, date, startTime, endTime, weather, dogCompanion, notes, gpxPath } = body;

    if (!routeName || !date) {
      return NextResponse.json({ error: "Route Name and Date are required" }, { status: 400 });
    }

    const walk = await db.fieldWalk.create({
      data: {
        routeName,
        date: new Date(date),
        startTime,
        endTime,
        weather,
        dogCompanion,
        notes,
        gpxPath,
      },
    });

    return NextResponse.json(walk);
  } catch (err: any) {
    console.error("POST Walk Error:", err);
    return NextResponse.json({ error: "Failed to create walk" }, { status: 500 });
  }
}
