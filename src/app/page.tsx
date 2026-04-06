import prisma from "@/lib/prisma";
import { HomeContent } from "@/components/home/HomeContent";

// Fetch real stats from the database
async function getPlatformStats() {
  const totalQuestions = await prisma.question.count();
  const totalMaterials = await prisma.material.count();
  const totalUsers = await prisma.user.count();
  const totalDiscussions = await prisma.discussion.count();
  const totalCodingQuestions = await (prisma as any).codingQuestion.count();
  const totalInterviews = await prisma.mockInterview.count();

  return {
    totalQuestions,
    totalMaterials,
    totalUsers,
    totalDiscussions,
    totalCodingQuestions,
    totalInterviews,
  };
}

async function getTopCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { name: "asc" },
    take: 8,
  });
}

async function getFeaturedMaterials() {
  return prisma.material.findMany({
    where: { isFeatured: true },
    orderBy: { views: "desc" },
    take: 3,
    select: { id: true, title: true, type: true, description: true, url: true },
  });
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, categories, materials] = await Promise.all([
    getPlatformStats(),
    getTopCategories(),
    getFeaturedMaterials(),
  ]);

  return <HomeContent stats={stats} categories={categories} materials={materials} />;
}
