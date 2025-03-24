import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getWordMeaning(word: string, language: 'en' | 'de') {
  const prompt = language === 'en' 
    ? `Extract the word or phrase from my input and provide its definition with examples. 
       Return a JSON object with these fields:
       - "word": the exact word or phrase being defined
       - "definition": a clear, concise markdown-formatted definition with:
         - Part of speech in bold
         - Examples in italic
         - Multiple meanings as bullet points

       For example, if I search "run", your response should be:
       {
         "word": "run",
         "definition": "**verb**\\n- To move quickly on foot.\\n*She runs every morning.*\\n- To operate or function.\\n*The machine runs smoothly.*"
       }

       My input is: "${word}"`
    : `Extract the German word or phrase from my input and provide its definition with examples. 
       Return a JSON object with these fields:
       - "word": the exact German word or phrase being defined
       - "definition": a clear, concise markdown-formatted definition with:
         - Gender/part of speech in bold
         - Examples in italic
         - Multiple meanings as bullet points

       For example, if I search "laufen", your response should be:
       {
         "word": "laufen",
         "definition": "**verb**\\n- Sich schnell zu Fuß fortbewegen.\\n*Sie läuft jeden Morgen.*\\n- In Betrieb sein.\\n*Die Maschine läuft reibungslos.*"
       }

       My input is: "${word}"`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful dictionary assistant that provides structured JSON responses with word definitions and examples."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 250,
    response_format: { type: "json_object" }
  });

  const responseContent = response.choices[0].message.content || '{"word": "", "definition": "No definition found."}';
  
  try {
    // Parse the JSON response
    const parsedResponse = JSON.parse(responseContent);
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    return {
      word: word,
      definition: "Error getting definition. Please try again."
    };
  }
} 