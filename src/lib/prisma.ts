import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { DATABASE_URL } from '$env/static/private';

export const prisma = new PrismaClient({
  datasourceUrl: DATABASE_URL
}).$extends(withAccelerate());
