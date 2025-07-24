import { prisma } from '$lib/prisma.js';
import { redirect, fail } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid';
import type { Actions } from './$types.js';
import { auth } from '$lib/auth/index.js';

// No hyphens or underscores now
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  21
);

export const actions: Actions = {
  default: async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return fail(401, {
        error: 'No user found'
      });
    }

    const data = await request.formData();
    const prompt = data.get('prompt') as string;
    const forLlm = data.get('forLlm') as string;
    const againstLlm = data.get('againstLlm') as string;

    if (!prompt?.trim()) {
      return fail(400, {
        error: 'Prompt is required'
      });
    }

    const debateId = nanoid();

    try {
      await prisma.debate.create({
        data: {
          id: debateId,
          prompt: prompt.trim(),
          forLlmId: forLlm,
          againstLlmId: againstLlm,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: session.user.id
        }
      });
    } catch (error) {
      console.error('Failed to create debate:', error);
      return fail(500, {
        error: 'Failed to create debate'
      });
    }

    return redirect(303, `/debate/${debateId}`);
  }
};
