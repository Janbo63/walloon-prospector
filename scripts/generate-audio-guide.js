/**
 * generate-audio-guide.js
 * 
 * Parses clean English and Czech tour scripts and calls ElevenLabs TTS
 * to generate high-quality offline voice narration.
 * 
 * Usage: node scripts/generate-audio-guide.js
 */

const fs = require('fs');
const path = require('path');

const API_KEY = 'sk_acc63baaf687aeb08148574fa76957dcca0a798439dd4feb';
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George - British, warm, professional historical narrator
const MODEL_ID = 'eleven_multilingual_v2';

const LANGUAGES = {
  en: {
    scriptPath: path.join(__dirname, '../tour-guide-english-clean.md'),
    outputDir: path.join(__dirname, '../public/audio/en'),
    trigger: '**Spoken Script:**'
  },
  cs: {
    scriptPath: path.join(__dirname, '../tour-guide-czech-clean.md'),
    outputDir: path.join(__dirname, '../public/audio/cs'),
    trigger: '**Mluvený scénář:**'
  }
};

async function textToSpeech(text, outputPath) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.75,
        style: 0.25,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TTS API failed: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);
  console.log(`  ✅ Generated: ${outputPath} (${buffer.length} bytes)`);
}

function parseScript(filePath, triggerText) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Split by stop sections (e.g. ## Stop 1 or ## Stop 2)
  const sections = content.split(/## Stop \d+:/gi);
  
  // Section 0 is the introduction header, indices 1 to 8 are the stops
  const stops = [];
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    
    // Find the trigger text
    const triggerIndex = section.indexOf(triggerText);
    if (triggerIndex === -1) {
      console.warn(`⚠️ Could not find trigger "${triggerText}" in section ${i}`);
      continue;
    }
    
    // Extract everything after trigger
    let text = section.substring(triggerIndex + triggerText.length).trim();
    
    // Remove the surrounding quotes (both double and single) and backticks if they wrap the text
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.substring(1, text.length - 1);
    } else if (text.startsWith('`') && text.endsWith('`')) {
      text = text.substring(1, text.length - 1);
    }
    
    // Clean up trailing dashes or dividers from the markdown file
    const dividerIndex = text.indexOf('---');
    if (dividerIndex !== -1) {
      text = text.substring(0, dividerIndex).trim();
    }
    
    // Strip remaining quotes if there are double quotes surrounding the whole speech block
    text = text.replace(/^"|"$/g, '').trim();
    
    stops.push({
      stopNumber: i,
      text: text
    });
  }
  
  return stops;
}

async function main() {
  console.log("🎙️ Starting Krobica Mine Audio Guide Voice Generation...");
  console.log("Using ElevenLabs Multilingual Model...");

  for (const [lang, config] of Object.entries(LANGUAGES)) {
    console.log(`\n📂 Processing Language: [${lang.toUpperCase()}]`);
    console.log(`Reading script from: ${config.scriptPath}`);

    if (!fs.existsSync(config.scriptPath)) {
      console.error(`❌ Script file not found: ${config.scriptPath}`);
      continue;
    }

    // Ensure output folder exists
    fs.mkdirSync(config.outputDir, { recursive: true });

    const stops = parseScript(config.scriptPath, config.trigger);
    console.log(`Found ${stops.length} stops to generate.`);

    for (const stop of stops) {
      const outputFilename = `stop-${stop.stopNumber}.mp3`;
      const outputPath = path.join(config.outputDir, outputFilename);
      
      console.log(`\n[Stop ${stop.stopNumber}/${stops.length}]`);
      console.log(`Text length: ${stop.text.length} characters.`);
      console.log(`Text snippet: "${stop.text.substring(0, 80)}..."`);
      
      try {
        await textToSpeech(stop.text, outputPath);
      } catch (err) {
        console.error(`❌ Failed Stop ${stop.stopNumber}:`, err.message);
      }

      // Add a small pause between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  console.log("\n✨ Voice Generation Completed successfully!");
}

main().catch(err => {
  console.error("Fatal Error in Voice Generator:", err);
  process.exit(1);
});
