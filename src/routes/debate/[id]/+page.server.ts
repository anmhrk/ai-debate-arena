import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/prisma.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, parent }) => {
  const { user } = await parent();

  if (!user) {
    redirect(303, '/');
  }

  const debateId = params.id;

  try {
    const debate = await prisma.debate.findUnique({
      where: {
        id: debateId
      },
      include: {
        messages: true
      }
    });

    if (!debate) {
      redirect(303, '/');
    }

    return {
      debate
    };
  } catch (err) {
    console.error('Error fetching debate:', err);
    redirect(303, '/');
  }
};
