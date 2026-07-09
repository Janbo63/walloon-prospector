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
    const specimens = await db.specimen.findMany({
      orderBy: { createdAt: "desc" },
      include: { fieldWalk: true, tumbleRun: true },
    });
    return NextResponse.json(specimens);
  } catch (err: any) {
    console.error("GET Specimens Error:", err);
    return NextResponse.json({ error: "Failed to fetch specimens" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      bagNumber,
      nameEn,
      namePl,
      nameCs,
      rockType,
      locationName,
      latitude,
      longitude,
      rawPhotoUrl,
      cleanPhotoUrl,
      status,
      estHardness,
      pricePln,
      storyEn,
      storyPl,
      storyCs,
      fieldWalkId,
      tumbleRunId,
    } = body;

    if (!bagNumber || !nameEn) {
      return NextResponse.json({ error: "Bag Number and Name are required" }, { status: 400 });
    }

    const specimen = await db.specimen.create({
      data: {
        bagNumber,
        nameEn,
        namePl,
        nameCs,
        rockType,
        locationName,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        rawPhotoUrl,
        cleanPhotoUrl,
        status: status || "ROUGH",
        estHardness: estHardness ? parseFloat(estHardness) : null,
        pricePln: pricePln ? parseFloat(pricePln) : null,
        storyEn,
        storyPl,
        storyCs,
        fieldWalkId,
        tumbleRunId,
      },
    });

    return NextResponse.json(specimen);
  } catch (err: any) {
    console.error("POST Specimen Error:", err);
    return NextResponse.json({ error: "Failed to create specimen" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Specimen ID is required" }, { status: 400 });
    }

    // Cast floats if present
    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);
    if (updateData.estHardness) updateData.estHardness = parseFloat(updateData.estHardness);
    if (updateData.pricePln) updateData.pricePln = parseFloat(updateData.pricePln);

    const specimen = await db.specimen.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(specimen);
  } catch (err: any) {
    console.error("PUT Specimen Error:", err);
    return NextResponse.json({ error: "Failed to update specimen" }, { status: 500 });
  }
}
