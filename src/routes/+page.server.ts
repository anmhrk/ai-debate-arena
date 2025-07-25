import { prisma } from '$lib/prisma.js';
import { redirect, fail } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid';
import type { Actions } from './$types.js';
import { auth } from '$lib/auth/index.js';
import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';
import { z } from 'zod';

// To prevent hyphens or underscores
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  21
);

const groq = new Groq({
  apiKey: GROQ_API_KEY
});

const debateValidationSchema = z.object({
  valid: z.boolean(),
  title: z.string().nullable()
});

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

    const debateId = nanoid();

    try {
      const response = await groq.chat.completions.create({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages: [
          {
            role: 'system',
            content: `
          You are tasked with validating and processing debate prompts.
          
          Follow these steps:
          1. FIRST, validate if the user prompt can be turned into a debate with two opposing sides:
            - It can be ANY topic, question, or statement that allows for arguments both FOR and AGAINST
            - This includes personal decisions, life choices, philosophical questions, controversial topics, policy debates, etc.
            - The key is whether reasonable arguments can be made on both sides
            - Examples of VALID prompts: "Should I quit my job?", "Is pineapple on pizza acceptable?", "Should AI replace human teachers?", "I should move to a different city", "Is working from home better than office work?"
            - Examples of INVALID prompts: Pure gibberish ("asdfghjkl", "random keyboard mashing"), factual statements with no debate potential ("The sky is blue", "2+2=4"), or completely nonsensical text

          2. If the prompt is INVALID (only gibberish or completely non-debatable):
            - Set valid to false
            - Set title to null

          3. If the prompt is VALID (can have two sides of arguments):
            - Set valid to true  
            - Create a concise 5-6 word title that captures the essence of the debate topic
            - The title should be clear and engaging

          Be inclusive - accept almost any topic that can generate opposing viewpoints, even personal questions and everyday decisions.
          Output JSON only using the schema provided.`
          },
          {
            role: 'user',
            content: `Please validate and process this debate prompt: "${prompt.trim()}"`
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'debate_validation',
            schema: z.toJSONSchema(debateValidationSchema)
          }
        }
      });

      const rawResult = JSON.parse(response.choices[0].message.content || '{}');
      const result = debateValidationSchema.parse(rawResult);

      if (!result.valid) {
        return fail(400, {
          error: 'Invalid user prompt'
        });
      }

      await prisma.debate.create({
        data: {
          id: debateId,
          title: result.title!,
          prompt: prompt.trim(),
          forLlmId: forLlm,
          againstLlmId: againstLlm,
          createdAt: new Date(),
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
