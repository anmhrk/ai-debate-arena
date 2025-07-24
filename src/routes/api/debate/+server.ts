import { createGroq } from '@ai-sdk/groq';
import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { GROQ_API_KEY } from '$env/static/private';

const groq = createGroq({
  apiKey: GROQ_API_KEY
});

export async function POST({ request }) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: groq('llama-3.1-8b-instant'),
    messages: convertToModelMessages(messages)
  });

  return result.toUIMessageStreamResponse();
}
