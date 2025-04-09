import { NextResponse } from 'next/server';
import { getLanguageAssistance } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { word, language, model = 'groq' } = await req.json();

    if (!word || !language) {
      return NextResponse.json(
        { error: 'Word and language are required' },
        { status: 400 }
      );
    }

    // Choose the model based on the model parameter
    let useGroq = false;
    let useMistral = false;
    
    switch (model.toLowerCase()) {
      case 'groq':
        useGroq = true;
        break;
      case 'mistral':
        useMistral = true;
        break;
      case 'huggingface': // For backward compatibility
        useMistral = true;
        break;
      case 'openai':
      default:
        // Default to OpenAI (both flags false)
        break;
    }

    try {
      const result = await getLanguageAssistance(word, language, useGroq, useMistral);

      // Pass the model information back to the client
      return NextResponse.json({
        title: result.title,
        answer: result.answer,
        suggestions: result.suggestions,
        modelUsed: result.modelUsed || model // Fallback to requested model if modelUsed is not provided
      });
    } catch (serviceError) {
      console.error('Service error:', serviceError);
      
      // Try with OpenAI as a last resort
      if (model !== 'openai') {
        console.log('Last resort fallback to OpenAI');
        try {
          const fallbackResult = await getLanguageAssistance(word, language, false, false);
          
          return NextResponse.json({
            title: fallbackResult.title,
            answer: fallbackResult.answer,
            suggestions: fallbackResult.suggestions,
            modelUsed: 'openai (fallback)'
          });
        } catch (fallbackError) {
          console.error('Even fallback to OpenAI failed:', fallbackError);
          return NextResponse.json(
            { error: 'All available models failed to respond. Please try again later.' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to get word meaning with the selected model' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error getting word meaning:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
