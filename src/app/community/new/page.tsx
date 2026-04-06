import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { NewDiscussionForm } from "@/components/community/new-discussion-form";
import { defaultCategorySeeds } from "@/lib/community";

export default async function NewThreadPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/community/new");
  }

  let categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    await prisma.category.createMany({
      data: defaultCategorySeeds.map((category) => ({
        name: category.name,
        description: category.description,
      })),
      skipDuplicates: true,
    });

    categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      targetRole: true,
      japaneseLevel: true,
    },
  });

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <NewDiscussionForm
        categories={categories}
        defaultRoleContext={user?.targetRole}
        defaultLevelContext={user?.japaneseLevel ?? null}
      />
    </div>
  );
}
