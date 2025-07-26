import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import { prisma } from '$lib/prisma';
import { nanoid } from 'nanoid';
import { json } from '@sveltejs/kit';
import { auth } from '$lib/auth/index.js';

const groq = new Groq({
  apiKey: GROQ_API_KEY
});

export async function GET({ url, request }) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const debateId = url.searchParams.get('id');

    if (!debateId) {
      return json({ error: 'Debate ID is required' }, { status: 400 });
    }

    const debate = await prisma.debate.findUnique({
      where: {
        id: debateId,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!debate) {
      return json({ error: 'Debate not found' }, { status: 404 });
    }

    return json({ debate });
  } catch (error) {
    console.error('Debate fetch error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Continue was hit
    if (debate.round_status === 'waiting_for_user') {
      await prisma.debate.update({
        where: { id: debateId },
        data: {
          round_status: 'waiting_for_for',
          current_round: debate.current_round + 1
        }
      });
    }

    const isForLlm = modelId === debate.forLlmId;

    const role = isForLlm ? 'FOR' : 'AGAINST';
    const opponentRole = isForLlm ? 'AGAINST' : 'FOR';

    const systemPrompt = `You're having a friendly discussion about: "${debate.title}"

    Here's what you're talking about: "${debate.prompt}"

    You're on the ${role} side, and the other person is ${opponentRole}.

    Just chat naturally and share your thoughts on why you think the ${role} side makes sense. You can:
    - Share your perspective and why you see it that way
    - Respond to what the other person said
    - Bring up interesting points or examples
    - Keep it conversational and engaging
    - Write like you're talking to a friend (2-3 paragraphs is perfect)
    - Feel free to acknowledge good points while still making your case

    Remember: You're representing the ${role} side in this chat, so focus on that perspective even if you might personally see it differently.`;

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

    const messagesToSend = [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      ...messagesForApi
    ];

    const response = await groq.chat.completions.create({
      model: modelId,
      messages: messagesToSend
    });

    const generatedContent = response.choices[0].message.content;

    if (!generatedContent) {
      return json({ error: 'No response generated' }, { status: 500 });
    }

    const nextStatus = isForLlm ? 'waiting_for_against' : 'waiting_for_user';

    await prisma.$transaction([
      prisma.debateMessage.create({
        data: {
          id: `${role.toLowerCase()}_${nanoid()}`,
          content: generatedContent,
          modelId: modelId,
          debateId: debateId,
          createdAt: new Date()
        }
      }),
      prisma.debate.update({
        where: { id: debateId },
        data: { round_status: nextStatus }
      })
    ]);

    return json({
      content: generatedContent
    });
  } catch (error) {
    console.error('Debate API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}
