import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hashed = await bcrypt.hash("changeme123", 10);
    const author = await prisma.user.upsert({
        where: { username: "admin" },
        update: {},
        create: { username: "admin", password: hashed, isAuthor: true },
    });
    await prisma.post.upsert({
        where: { id: 1 },
        update: {},
        create: {
            title: "Hello World",
            content: "<p>First post.</p>",
            published: true,
            authorId: author.id,
        },
    });
    console.log("Seeded.");
}

main().catch(console.error).finally(() => prisma.$disconnect());