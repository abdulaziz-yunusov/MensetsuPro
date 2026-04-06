import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const materials = await prisma.material.findMany({ take: 3 })
  for (const m of materials) {
    await prisma.material.update({
      where: { id: m.id },
      data: { isFeatured: true }
    })
    console.log(`Featured material: ${m.title}`)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
