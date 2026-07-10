import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { logToStef } from "@/lib/stef-logger";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { name, rockType, locationName, estHardness } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      await logToStef("error", "GEMINI_API_KEY is missing in /api/provenance");
      return NextResponse.json({ error: "API Key Configuration Error" }, { status: 500 });
    }

    const prompt = `You are an expert mineral storyteller and folklorist specializing in the Sudeten mountain range and Jizera region. Generate a retail-ready, historical provenance story for a specific rock specimen:
    - Name: ${name}
    - Rock Type: ${rockType}
    - Found at: ${locationName || "Izera Foothills near Mirsk"}
    - Mohs Hardness: ${estHardness || "N/A"}
    
    Output a valid JSON object containing:
    - storyEn: A captivating, romantic, historical story connecting this stone to regional folklore (Walloons/Venediger, Wrocławska Księga Walońska, or the Mountain Spirit Liczyrzepa/Rübezahl) in English.
    - storyPl: The same story in Polish.
    - storyCs: The same story in Czech.
    
    Guidelines:
    * Keep the stories engaging, professional, and under 150 words per language.
    * Focus on the lore of medieval prospectors searching for precious ores (like tin in Krobica, gold in Szklarska Poręba, or iron/quartz).
    * Make it feel like a premium history card for a farm shop specimen.
    
    Format:
    {
      "storyEn": "...",
      "storyPl": "...",
      "storyCs": "..."
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Provenance API Error:", err);
    await logToStef("error", `Failed to generate provenance: ${err.message}`);
    return NextResponse.json({ error: "Failed to generate provenance story" }, { status: 500 });
  }
}
