import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { logToStef } from "@/lib/stef-logger";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const mode = (formData.get("mode") as string) || "visitor";
    const lang = (formData.get("lang") as string) || "en";

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      await logToStef("error", "GEMINI_API_KEY environment variable is missing");
      return NextResponse.json({ error: "API Key Configuration Error" }, { status: 500 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    const languageNames = {
      en: "English",
      pl: "Polish",
      cs: "Czech",
    };

    const targetLangName = languageNames[lang as keyof typeof languageNames] || "English";

    let prompt = "";
    if (mode === "visitor") {
      prompt = `You are a wise medieval Walloon prospector's alchemist. Identify this rock from the photo. Keep it simple, engaging, and friendly for tourists and families visiting our farm (Zagroda Alpakoterapii) in the Jizerské/Sudeten mountains near Mirsk/Krobica.
      
      Output a valid JSON object in ${targetLangName} with the following fields:
      - name: The rock's common name in ${targetLangName}.
      - description: A short, simple, kid-friendly explanation in ${targetLangName}.
      - composition: Simplified description of what it's made of (e.g. 'shiny mica sheets', 'milky white quartz') in ${targetLangName}.
      - lore: An engaging Walloon story or legend about this stone in ${targetLangName}, referencing how medieval treasure hunters (Walloons / Vlaši / Walończycy) or the Mountain Spirit (Liczyrzepa / Duch Gór / Rübezahl) viewed it. Connect it to local lore (e.g. Krobica tin mines, Izera gneiss, gold guides, quartz veins, garnets). Keep it under 4 sentences, write in a warm, mysterious storytelling tone.
      
      Format:
      {
        "name": "...",
        "description": "...",
        "composition": "...",
        "lore": "..."
      }`;
    } else {
      prompt = `You are a professional geologist and mineralogist specializing in the Sudeten mountain range and Stara Kamienica schist belt (Krobica, Gierczyn, Przecznica, Szklarska Poręba). Analyze this rock from the photo.
      
      Output a valid JSON object containing:
      - nameEn: Precise mineralogical name in English.
      - namePl: Precise mineralogical name in Polish.
      - nameCs: Precise mineralogical name in Czech (use Vlaši/Vlašské terms where appropriate).
      - rockType: The rock/mineral category (e.g. 'Mica Schist', 'Milky Quartz', 'Chalcopyrite', 'Almandine Garnet').
      - estHardness: Estimated Mohs hardness (a floating point number between 1.0 and 10.0).
      - composition: A scientific explanation of its mineral structure, crystal habit, luster, and mineral associations.
      - storyEn: A provenance story connecting this stone to local Sudeten folklore (Walloons, Wrocławska Księga Walońska, Liczyrzepa) in English.
      - storyPl: The same story in Polish.
      - storyCs: The same story in Czech.
      
      The stories should be written in a high-end retail 'provenance card' style (romantic, historical, engaging, and under 150 words).
      
      Format:
      {
        "nameEn": "...",
        "namePl": "...",
        "nameCs": "...",
        "rockType": "...",
        "estHardness": 6.5,
        "composition": "...",
        "storyEn": "...",
        "storyPl": "...",
        "storyCs": "..."
      }`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: file.type || "image/png",
          },
        },
        prompt,
      ],
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
    console.error("Gemini Error:", err);
    await logToStef("error", `Failed to identify stone via API: ${err.message}`, {
      stack: err.stack,
    });
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
