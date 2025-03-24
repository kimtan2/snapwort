import { NextResponse } from 'next/server';
import { getWordMeaning } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { word, language } = await req.json();

    if (!word || !language) {
      return NextResponse.json(
        { error: 'Word and language are required' },
        { status: 400 }
      );
    }

    const meaning = await getWordMeaning(word, language);

    return NextResponse.json({ meaning });
  } catch (error) {
    console.error('Error getting word meaning:', error);
    return NextResponse.json(
      { error: 'Failed to get word meaning' },
      { status: 500 }
    );
  }
}
