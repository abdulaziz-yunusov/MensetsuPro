"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { searchAllExternalSources, ExternalMaterial } from "@/lib/services/external-materials";

export async function searchExternalMaterials(query: string): Promise<{
  success: boolean;
  results: ExternalMaterial[];
  error?: string;
}> {
  if (!query || query.length < 3) {
    return { success: true, results: [] };
  }

  try {
    const results = await searchAllExternalSources(query);
    return { success: true, results };
  } catch (error) {
    console.error("External search error:", error);
    return { success: false, results: [], error: "Failed to fetch external resources." };
  }
}

export async function toggleSaveMaterial(materialId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to save materials" };
    }

    const userId = session.user.id;

    // Check if already saved
    const existingSave = await prisma.savedMaterial.findUnique({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await prisma.savedMaterial.delete({
        where: {
          id: existingSave.id,
        },
      });
      
      revalidatePath("/materials");
      revalidatePath("/dashboard/bookmarks");
      return { success: true, saved: false };
    } else {
      // Save
      await prisma.savedMaterial.create({
        data: {
          userId,
          materialId,
        },
      });
      
      revalidatePath("/materials");
      revalidatePath(`/materials/${materialId}`);
      revalidatePath("/dashboard/bookmarks");
      return { success: true, saved: true };
    }
  } catch (error) {
    console.error("Error toggling saved material:", error);
    return { success: false, error: "Failed to update saved material" };
  }
}

export async function incrementMaterialViews(materialId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Use a transaction to ensure both operations succeed/fail together
    // Note: We're not doing a strict "one view per user" check here to keep it simple,
    // but the MaterialView table will allow for unique user counting later.
    await prisma.$transaction([
      prisma.materialView.create({
        data: {
          materialId,
          userId,
        },
      }),
      prisma.material.update({
        where: { id: materialId },
        data: {
          views: {
            increment: 1,
          },
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error incrementing material views:", error);
    return { success: false };
  }
}
