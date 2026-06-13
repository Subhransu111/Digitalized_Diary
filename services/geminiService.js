const { GoogleGenAI, Type } = require('@google/genai');

let ai;

try {
    if (process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } else {
        console.warn('WARNING: GEMINI_API_KEY is missing in environment variables.');
    }
} catch (error) {
    console.error('Failed to initialize Google Gen AI SDK:', error);
}

const caseExtractionSchema = {
    type: Type.OBJECT,
    properties: {
        caseNumber: {
            type: Type.STRING,
            description: 'Extracted case number if mentioned, e.g. CYB-2026-045',
        },
        caseTitle: {
            type: Type.STRING,
            description: 'A concise, formal title for the case',
        },
        caseDescription: {
            type: Type.STRING,
            description: 'A clean, detailed narrative description of the incident',
        },
        witnesses: {
            type: Type.ARRAY,
            description: 'List of witnesses or complainants mentioned',
            items: {
                type: Type.OBJECT,
                properties: {
                    witnessName: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    email: { type: Type.STRING },
                    address: { type: Type.STRING },
                    statement: {
                        type: Type.STRING,
                        description: 'Summary of what they saw or reported',
                    },
                },
            },
        },
        seizures: {
            type: Type.ARRAY,
            description: 'List of items, evidence, or properties seized',
            items: {
                type: Type.OBJECT,
                properties: {
                    itemDescription: { type: Type.STRING },
                    quantity: { type: Type.INTEGER },
                    locationSeized: { type: Type.STRING },
                    seizedBy: {
                        type: Type.STRING,
                        description: 'Officer who seized the item',
                    },
                },
            },
        },
        facts: {
            type: Type.ARRAY,
            description: 'List of key observations or digital traces',
            items: {
                type: Type.OBJECT,
                properties: {
                    factDescription: { type: Type.STRING },
                    factType: {
                        type: Type.STRING,
                        enum: ['Observation', 'Digital Trace', 'Suspect Action'],
                    },
                },
            },
        },
    },
};

function requireClient() {
    if (!ai) {
        throw new Error('Gemini client is not initialized. Check GEMINI_API_KEY.');
    }
}

async function extractCaseDetails(caseText) {
    requireClient();

    const prompt = `You are a professional police-tech data extraction model.
Analyze the case narration provided by the officer and extract structured data.
Do not invent facts. If a field is not present or cannot be inferred, return an empty string "" or an empty array.
Use formal, official police reporting language.

Case Narration:
"${caseText}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: caseExtractionSchema,
            },
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error('Empty response received from Gemini model.');
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error('Gemini Extraction Error:', error);
        throw new Error(`Extraction failed: ${error.message}`);
    }
}

async function generateEmbedding(text) {
    requireClient();

    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
        });

        if (response.embeddings?.[0]?.values) {
            return response.embeddings[0].values;
        }

        if (response.embedding?.values) {
            return response.embedding.values;
        }

        throw new Error('Invalid response format from embedding endpoint.');
    } catch (error) {
        console.error('Gemini Embedding Error:', error);
        throw new Error(`Embedding generation failed: ${error.message}`);
    }
}

module.exports = {
    extractCaseDetails,
    generateEmbedding,
};
