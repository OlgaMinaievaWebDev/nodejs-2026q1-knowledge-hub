import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ArticleStatus, PrismaClient, UserRole } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const usersData = [
    {
      login: 'admin',
      password: '12345',
      role: UserRole.ADMIN,
    },
    {
      login: 'editor',
      password: '12345',
      role: UserRole.EDITOR,
    },
  ];

  const categoriesData = [
    {
      name: 'FrontEnd',
      description: 'Articles about UI and client-side apps',
    },
    {
      name: 'BackEnd',
      description: 'Articles about server-side development',
    },
    {
      name: 'DevOps',
      description: 'Articles about deployment and infrastructure',
    },
  ];
  const articlesData = [
    {
      title: 'Intro to Backend',
      content: 'This is a beginner backend article',
      status: ArticleStatus.DRAFT,
      categoryName: 'BackEnd',
    },
    {
      title: 'API Design Basics',
      content: 'How to design clean APIs',
      status: ArticleStatus.ARCHIVED,
      categoryName: 'BackEnd',
    },
    {
      title: 'Intro to Frontend',
      content: 'This is beginner frontend article',
      status: ArticleStatus.PUBLISHED,
      categoryName: 'FrontEnd',
    },
    {
      title: 'Typescript as a tool',
      content: 'How to you Typescript to code efficient',
      status: ArticleStatus.PUBLISHED,
      categoryName: 'DevOps',
    },
    {
      title: 'UI/UX Design Basics',
      content: 'How to design user friendly apps',
      status: ArticleStatus.DRAFT,
      categoryName: 'FrontEnd',
    },
  ];

  const commentsData = [
    {
      content: 'This was great introduction article to BackEnd',
    },
    {
      content: 'I wish I found this resource earlier',
    },
    {
      content: 'Great intro article to BackEnd',
    },
  ];

  const tagsData = [
    {
      name: 'backend',
    },
    {
      name: 'api',
    },
    {
      name: 'prisma',
    },
    {
      name: 'database',
    },
    {
      name: 'frontend',
    },
  ];

  for (const user of usersData) {
    const createdUser = await prisma.user.upsert({
      where: { login: user.login },
      update: {},
      create: user,
    });
    console.log(`Seeded user: ${createdUser.login}`);
  }

  for (const category of categoriesData) {
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log(`Seeded category: ${createdCategory.name}`);
  }

  //get users & categories
  const admin = await prisma.user.findUnique({
    where: { login: 'admin' },
  });

  for (const article of articlesData) {
    const category = await prisma.category.findUnique({
      where: { name: article.categoryName },
    });
    const articleCreated = await prisma.article.create({
      data: {
        title: article.title,
        content: article.content,
        status: article.status,
        authorId: admin!.id,
        categoryId: category!.id,
      },
    });
    console.log(`Seeded article: ${articleCreated.title}`);
  }

  //get articleId
  const foundArticle = await prisma.article.findFirst({
    where: { title: 'Intro to Backend' },
  });

  for (const comment of commentsData) {
    const commentCreated = await prisma.comment.create({
      data: {
        ...comment,
        authorId: admin!.id,
        articleId: foundArticle!.id,
      },
    });
    console.log(`Seeded comment: ${commentCreated.content}`);
  }

  for (const tag of tagsData) {
    const tagCreated = await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
    console.log(`Seeded tag: ${tagCreated.name}`);
  }

  //get all tags
  // const allTags = await prisma.tag.findMany();

  const updatedArticle = await prisma.article.update({
    where: { id: foundArticle!.id },
    data: {
      tags: {
        connect: [{ name: 'api' }, { name: 'prisma' }],
      },
    },
  });
  console.log('Updated article id:', updatedArticle.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
