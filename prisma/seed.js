import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const published = await prisma.post.count({ where: { published: true } });
  if (published > 0) {
    console.log('Seed skipped: published posts already exist.');
    return;
  }

  const password = await bcrypt.hash('changeme123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'author@example.com' },
    update: { isAuthor: true },
    create: {
      username: 'author',
      email: 'author@example.com',
      password,
      isAuthor: true,
    },
  });

  await prisma.post.create({
    data: {
      title: 'Welcome to the blog',
      content:
        'This post was created by prisma/seed.js. The public site lists only published posts.',
      published: true,
      authorId: user.id,
    },
  });

  console.log('Seed done: author@example.com / changeme123 (author)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
