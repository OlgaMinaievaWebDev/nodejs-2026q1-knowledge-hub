import { PrismaClient, ArticleStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      login: 'admin',
      password: 'admin123',
      role: UserRole.ADMIN,
    },
  });

  const editor = await prisma.user.create({
    data: {
      login: 'editor',
      password: 'editor123',
      role: UserRole.EDITOR,
    },
  });

  await prisma.category.createMany({
    data: [
      {
        name: 'Backend',
        description: 'Server-side development and APIs',
      },
      {
        name: 'Frontend',
        description: 'Client-side UI and browser apps',
      },
      {
        name: 'DevOps',
        description: 'Deployment, infrastructure, and CI/CD',
      },
    ],
  });

  await prisma.tag.createMany({
    data: [
      { name: 'nodejs' },
      { name: 'nestjs' },
      { name: 'typescript' },
      { name: 'prisma' },
      { name: 'docker' },
    ],
  });

  const backendCategory = await prisma.category.findFirst({
    where: { name: 'Backend' },
  });

  const frontendCategory = await prisma.category.findFirst({
    where: { name: 'Frontend' },
  });

  const devopsCategory = await prisma.category.findFirst({
    where: { name: 'DevOps' },
  });

  const articlesData = [
    {
      title: 'Getting Started with NestJS',
      content: 'NestJS helps build scalable server-side applications.',
      status: ArticleStatus.DRAFT,
      authorId: admin.id,
      categoryId: backendCategory?.id ?? null,
      tags: ['nestjs', 'typescript'],
    },
    {
      title: 'Using Prisma with PostgreSQL',
      content: 'Prisma makes database access type-safe and convenient.',
      status: ArticleStatus.PUBLISHED,
      authorId: admin.id,
      categoryId: backendCategory?.id ?? null,
      tags: ['prisma', 'typescript'],
    },
    {
      title: 'Docker Basics',
      content: 'Docker helps package and run applications consistently.',
      status: ArticleStatus.PUBLISHED,
      authorId: editor.id,
      categoryId: devopsCategory?.id ?? null,
      tags: ['docker'],
    },
    {
      title: 'Node.js Streams Overview',
      content: 'Streams allow efficient processing of large data.',
      status: ArticleStatus.ARCHIVED,
      authorId: editor.id,
      categoryId: backendCategory?.id ?? null,
      tags: ['nodejs'],
    },
    {
      title: 'Frontend and API Integration',
      content: 'Connecting frontend apps to REST APIs cleanly.',
      status: ArticleStatus.DRAFT,
      authorId: admin.id,
      categoryId: frontendCategory?.id ?? null,
      tags: ['typescript', 'nodejs'],
    },
  ];

  const createdArticles = [];
  for (const article of articlesData) {
    const created = await prisma.article.create({
      data: {
        title: article.title,
        content: article.content,
        status: article.status,
        authorId: article.authorId,
        categoryId: article.categoryId,
        tags: {
          connect: article.tags.map((name) => ({ name })),
        },
      },
    });

    createdArticles.push(created);
  }

  await prisma.comment.createMany({
    data: [
      {
        content: 'Great intro to NestJS',
        articleId: createdArticles[0].id,
        authorId: editor.id,
      },
      {
        content: 'Prisma with Postgres is very productive',
        articleId: createdArticles[1].id,
        authorId: admin.id,
      },
      {
        content: 'Docker is essential for deployment',
        articleId: createdArticles[2].id,
        authorId: null,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
