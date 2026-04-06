import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories...');
  
  const categories = [
    { name: "Self-Introduction", description: "Questions about your background and personal history." },
    { name: "Motivation / Why Japan", description: "Questions about your drive to work in Japan." },
    { name: "Behavioral & Strengths", description: "Questions about your personality and soft skills." },
    { name: "IT & Technical", description: "Technical questions related to software engineering." },
    { name: "Teamwork & Communication", description: "Questions about collaborating with others." },
    { name: "Career Vision", description: "Questions about your future goals." },
    { name: "Preparation", description: "Materials for initial application phases." },
    { name: "Culture", description: "Insights into Japanese corporate culture." },
    { name: "Language", description: "Resources for Japanese language proficiency." },
    { name: "Technical", description: "Resources for technical skill improvement." },
    { name: "Strategy", description: "Interview and job hunting strategies." },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const allCats = await prisma.category.findMany();
  const getCatId = (name: string) => allCats.find(c => c.name === name)?.id || '';

  console.log('Seeding questions...');
  
  const questions = [
    {
      title: "自己紹介をお願いします。",
      titleEn: "Please introduce yourself.",
      categoryId: getCatId("Self-Introduction"),
      difficulty: "Beginner",
      tips: "Being too personal, talking too long (over 1 minute), or forgetting the formal greeting at the end.",
      recommendedAnswer: "1. Name & Background\n2. Key skills summary\n3. Conclusion (Yoroshiku onegaishimasu)",
      sampleAnswer: "初めまして、〇〇と申します。現在〇〇大学で情報工学を専攻しており、主にフロントエンド開発について学んでいます。これまでにReactを用いたチーム開発の経験があり、UI/UXの改善に貢献しました。本日はよろしくお願いいたします。",
      commonMistakes: "Being too personal, talking too long (over 1 minute), or forgetting the formal greeting at the end."
    },
    {
      title: "なぜ弊社で働きたいのですか？",
      titleEn: "Why do you want to work for our company?",
      categoryId: getCatId("Motivation / Why Japan"),
      difficulty: "Intermediate",
      tips: "Only focusing on employee benefits (salary, remote work, stability) rather than what value you can bring to the company.",
      recommendedAnswer: "1. Alignment with company vision\n2. Specific product/service you appreciate\n3. How your skills can contribute",
      sampleAnswer: "御社の「テクノロジーで生活を豊かにする」というビジョンに大変共感しております。特に、〇〇というアプリのユーザビリティの高さに感銘を受けました。私のフロントエンドのスキルを活かし、さらに多くのユーザーにとって使いやすいUIを提供することで貢献したいと考えております。",
      commonMistakes: "Only focusing on employee benefits (salary, remote work, stability) rather than what value you can bring to the company."
    },
    {
      title: "今までで一番難しかった開発経験を教えてください。",
      titleEn: "Tell us about your most difficult development experience.",
      categoryId: getCatId("IT & Technical"),
      difficulty: "Advanced",
      tips: "Blaming others for the difficulty. Failing to specify the exact technical steps you took to solve the problem.",
      recommendedAnswer: "Use the STAR method:\nS: Situation\nT: Task\nA: Action\nR: Result",
      sampleAnswer: "最も困難だったのは、大学のプロジェクトで既存の重いAPIのレスポンス時間を改善したことです。初期ロードに5秒かかっていましたが、Redisを用いてキャッシュ層を導入し、N+1問題を解決することでレスポンスを0.5秒まで短縮しました。",
      commonMistakes: "Blaming others for the difficulty. Failing to specify the exact technical steps you took to solve the problem."
    }
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: q
    });
  }

  console.log('Seeding materials...');

  const materials = [
    {
      title: "Mastering the IT Entry Sheet (ES)",
      description: "Learn what top Japanese tech companies look for in your initial application and how to structure your motivation.",
      type: "video",
      url: "https://www.youtube.com/watch?v=W4zrPtW8GvA",
      difficulty: "Beginner",
      categoryId: getCatId("Preparation"),
    },
    {
      title: "Understanding Honne vs. Tatemae in Interviews",
      description: "A crucial concept for navigating behavioral questions. Understand when to speak your true mind and when to be diplomatic.",
      type: "article",
      url: "https://example.com/honne-tatemae",
      difficulty: "Advanced",
      categoryId: getCatId("Culture"),
    },
    {
      title: "BJT Business Japanese Proficiency Test Guide",
      description: "Comprehensive guide to achieving J2 or J1 level. Essential for non-native speakers targeting traditional tech firms.",
      type: "book",
      url: "https://example.com/bjt-guide",
      difficulty: "Intermediate",
      categoryId: getCatId("Language"),
    },
    {
      title: "Most Common Live Coding Challenges in Japan",
      description: "A rundown of the top 5 algorithmic challenges asked by companies like Mercari, Line, and Rakuten.",
      type: "video",
      url: "https://www.youtube.com/watch?v=example2",
      difficulty: "Intermediate",
      categoryId: getCatId("Technical"),
    },
    {
      title: "Proper Keigo Usage for Interviews",
      description: "Cheat sheet of common Sonkeigo (respectful) and Kenjougo (humble) phrases to use when speaking to interviewers.",
      type: "article",
      url: "https://example.com/keigo-guide",
      difficulty: "Beginner",
      categoryId: getCatId("Language"),
    },
    {
      title: "Reverse Interviewing: Questions you SHOULD ask",
      description: "What to ask at the end of the interview when they say 'Do you have any questions for us?'.",
      type: "article",
      url: "https://example.com/reverse-interviewing",
      difficulty: "Beginner",
      categoryId: getCatId("Strategy"),
    }
  ];

  for (const m of materials) {
    const existing = await prisma.material.findFirst({
      where: { title: m.title }
    });

    if (existing) {
      await prisma.material.update({
        where: { id: existing.id },
        data: m
      });
    } else {
      await prisma.material.create({
        data: m
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
