import { Metadata } from "next";
import prisma from "@/lib/prisma";
import MaterialList from "@/components/learning/material-list";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DatabaseUnavailableBanner } from "@/components/layout/database-unavailable-banner";
import { isDatabaseConnectionError } from "@/lib/db-error";

export const metadata: Metadata = {
  title: "Learning Materials | MensetsuPro",
  description: "Curated videos, books, and articles to ace your Japanese interviews.",
};

export default async function MaterialsPage() {
  const session = await getServerSession(authOptions);
  let materials: any[] = [];
  let categories: { id: string; name: string }[] = [];
  let savedMaterials: { materialId: string }[] = [];
  let dbUnavailable = false;

  try {
    [materials, categories, savedMaterials] = await Promise.all([
      prisma.material.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.category.findMany({
        where: {
          materials: {
            some: {}
          }
        }
      }),
      session?.user?.id 
        ? prisma.savedMaterial.findMany({
            where: { userId: session.user.id },
            select: { materialId: true }
          })
        : Promise.resolve([]),
    ]);
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    dbUnavailable = true;
  }

  const savedMaterialIds = savedMaterials.map((sm: { materialId: string }) => sm.materialId);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Structured Learning Materials</h1>
          <p className="text-muted-foreground mt-2">Curated resources to understand the corporate culture, pass resume screenings, and ace the interviews.</p>
        </div>
      </div>

      {dbUnavailable ? <DatabaseUnavailableBanner resourceName="Learning materials" /> : null}

      <MaterialList 
        materials={materials} 
        categories={categories} 
        savedMaterialIds={savedMaterialIds}
      />
    </div>
  );
}
