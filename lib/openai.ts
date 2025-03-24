import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getWordMeaning(word: string, language: 'en' | 'de') {
  const prompt = language === 'en' 
    ? `Provide a clear and concise definition of the English word "${word}". Include its part of speech and a brief example if relevant.`
    : `Provide a clear and concise definition of the German word "${word}". Include its gender if it's a noun, and a brief example if relevant.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful dictionary assistant that provides clear, concise definitions."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0].message.content || 'No definition found.';
} 