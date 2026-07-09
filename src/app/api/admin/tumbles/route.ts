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
    const runs = await db.tumbleRun.findMany({
      orderBy: { startDate: "desc" },
      include: { specimens: true, stageLogs: true },
    });
    return NextResponse.json(runs);
  } catch (err: any) {
    console.error("GET Tumbles Error:", err);
    return NextResponse.json({ error: "Failed to fetch tumble runs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { barrelSize, tumblerModel, startDate, specimenIds } = body;

    if (!barrelSize || !tumblerModel || !startDate) {
      return NextResponse.json({ error: "Barrel Size, Model, and Start Date are required" }, { status: 400 });
    }

    // Start a transaction
    const result = await db.$transaction(async (tx) => {
      const run = await tx.tumbleRun.create({
        data: {
          barrelSize,
          tumblerModel,
          startDate: new Date(startDate),
          status: "RUNNING",
          currentStage: "STAGE_1",
        },
      });

      // Link specimens
      if (specimenIds && Array.isArray(specimenIds) && specimenIds.length > 0) {
        await tx.specimen.updateMany({
          where: { id: { in: specimenIds } },
          data: {
            tumbleRunId: run.id,
            status: "IN_TUMBLE",
          },
        });
      }

      // Create initial log
      await tx.tumbleStageLog.create({
        data: {
          tumbleRunId: run.id,
          stage: "STAGE_1",
          startDate: new Date(startDate),
          gritUsed: "60/90 Silicon Carbide",
          details: "Initial tumble run started.",
        },
      });

      return run;
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("POST Tumble Error:", err);
    return NextResponse.json({ error: "Failed to create tumble run" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, nextStage, gritUsed, details, endDate } = body;

    if (!id || !nextStage) {
      return NextResponse.json({ error: "Tumble Run ID and Next Stage are required" }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      const now = new Date();

      // Update current active log's end date
      const activeLogs = await tx.tumbleStageLog.findMany({
        where: { tumbleRunId: id, endDate: null },
      });

      for (const log of activeLogs) {
        await tx.tumbleStageLog.update({
          where: { id: log.id },
          data: { endDate: now },
        });
      }

      let runStatus = "RUNNING";
      if (nextStage === "COMPLETED") {
        runStatus = "COMPLETED";
      }

      // Update the tumble run
      const run = await tx.tumbleRun.update({
        where: { id },
        data: {
          currentStage: nextStage,
          status: runStatus,
          endDate: nextStage === "COMPLETED" ? now : null,
        },
      });

      // Create new stage log if not completed
      if (nextStage !== "COMPLETED") {
        await tx.tumbleStageLog.create({
          data: {
            tumbleRunId: id,
            stage: nextStage,
            startDate: now,
            gritUsed: gritUsed || "N/A",
            details: details || "",
          },
        });
      } else {
        // If completed, update linked specimens status to CABINET (ready to sort/grade)
        await tx.specimen.updateMany({
          where: { tumbleRunId: id },
          data: { status: "CABINET" },
        });
      }

      return run;
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("PUT Tumble Error:", err);
    return NextResponse.json({ error: "Failed to progress tumble run" }, { status: 500 });
  }
}
