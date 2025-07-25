import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import { prisma } from '$lib/prisma';
import { nanoid } from 'nanoid';
import { json } from '@sveltejs/kit';
import { auth } from '$lib/auth/index.js';

const groq = new Groq({
  apiKey: GROQ_API_KEY
});

export async function POST({ request }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { debateId, modelId } = await request.json();

    const debate = await prisma.debate.findUnique({
      where: { id: debateId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!debate) {
      return json({ error: 'Debate not found' }, { status: 404 });
    }

    const isForLlm = modelId === debate.forLlmId;
    const isAgainstLlm = modelId === debate.againstLlmId;

    if (!isForLlm && !isAgainstLlm) {
      return json({ error: 'Invalid model for this debate' }, { status: 400 });
    }

    const role = isForLlm ? 'FOR' : 'AGAINST';
    const opponentRole = isForLlm ? 'AGAINST' : 'FOR';

    const systemPrompt = `You are an AI model participating in a structured debate about: "${debate.title}"

    The debate prompt is: "${debate.prompt}"

    You are arguing ${role} this position. Your opponent is arguing ${opponentRole}.

    Your role is to:
    - Present compelling arguments that support your assigned position
    - Address counterarguments effectively
    - Use logical reasoning and evidence
    - Stay focused on the debate topic
    - Be respectful but persuasive
    - Keep responses concise and impactful (aim for 2-3 paragraphs)
    - Build upon your previous arguments while responding to your opponent's points

    Remember: You must argue ${role} the position regardless of your personal views. Make the strongest case possible for your assigned side.`;

    const messagesForApi = debate.messages.map((msg) => {
      if (msg.modelId === modelId) {
        return {
          role: 'assistant' as const,
          content: `[YOUR PREVIOUS ARGUMENT]: ${msg.content}`
        };
      } else {
        return {
          role: 'user' as const,
          content: `[OPPONENT'S ARGUMENT]: ${msg.content}`
        };
      }
    });

    const messages = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      ...messagesForApi
    ];

    const response = await groq.chat.completions.create({
      model: modelId,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const generatedContent = response.choices[0].message.content;

    if (!generatedContent) {
      return json({ error: 'No response generated' }, { status: 500 });
    }

    await prisma.debateMessage.create({
      data: {
        id: `${role.toLowerCase()}_${nanoid()}`,
        content: generatedContent,
        modelId: modelId,
        debateId: debateId,
        createdAt: new Date()
      }
    });

    await prisma.debate.update({
      where: { id: debateId },
      data: {
        round: debate.round + 1,
        updatedAt: new Date()
      }
    });

    return json({
      content: generatedContent
    });
  } catch (error) {
    console.error('Debate API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
