import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const codingQuestions = [
  {
    title: "Get Prime Numbers",
    description: "Write a function `getPrimes(n)` that returns an array of all prime numbers less than or equal to `n`.",
    difficulty: "Beginner",
    initialCode: "function getPrimes(n) {\n  // your code here\n  return [];\n}",
    testCases: [
      { input: [10], expectedOutput: [2, 3, 5, 7] },
      { input: [20], expectedOutput: [2, 3, 5, 7, 11, 13, 17, 19] },
      { input: [2], expectedOutput: [2] },
      { input: [1], expectedOutput: [] }
    ]
  },
  {
    title: "Two Sum",
    description: "Write a function `twoSum(nums, target)` that returns the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. Return the indices in an array.",
    difficulty: "Intermediate",
    initialCode: "function twoSum(nums, target) {\n  // your code here\n  return [];\n}",
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
      { input: [[3, 3], 6], expectedOutput: [0, 1] }
    ]
  },
  {
    title: "Reverse String",
    description: "Write a function `reverseString(str)` that reverses a string.",
    difficulty: "Beginner",
    initialCode: "function reverseString(str) {\n  // your code here\n  return str;\n}",
    testCases: [
      { input: ["hello"], expectedOutput: "olleh" },
      { input: ["MensetsuPro"], expectedOutput: "orPustesneM" },
      { input: [""], expectedOutput: "" }
    ]
  }
];

async function main() {
  console.log('Seeding Coding Questions...');
  
  // Create or get category for IT & Technical
  let category = await prisma.category.findUnique({
    where: { name: "IT & Technical" }
  });
  
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "IT & Technical",
        description: "Technical questions related to software engineering."
      }
    });
  }

  for (const q of codingQuestions) {
    // @ts-ignore
    await prisma.codingQuestion.create({
      data: {
        ...q,
        categoryId: category.id
      }
    });
    console.log(`Seeded coding question: ${q.title}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
