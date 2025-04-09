import { NextResponse } from 'next/server';
import { getFollowUp } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { question, language, previousContext, model = 'groq' } = await req.json();

    if (!question || !language) {
      return NextResponse.json(
        { error: 'Question and language are required' },
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
      const result = await getFollowUp(question, language, previousContext, useGroq, useMistral);

      return NextResponse.json({ 
        answer: result.answer,
        modelUsed: result.modelUsed
      });
    } catch (serviceError) {
      console.error('Service error:', serviceError);
      
      // Try with OpenAI as a last resort
      if (model !== 'openai') {
        console.log('Last resort fallback to OpenAI');
        try {
          const fallbackResult = await getFollowUp(question, language, previousContext, false, false);
          
          return NextResponse.json({
            answer: fallbackResult.answer,
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
          { error: 'Failed to get an answer with the selected model' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error processing follow-up question:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
} 