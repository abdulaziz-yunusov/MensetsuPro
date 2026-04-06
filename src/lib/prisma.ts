import { PrismaClient } from '@prisma/client'

const resolvedDatasourceUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.DIRECT_URL ?? process.env.DATABASE_URL
    : process.env.DATABASE_URL

const prismaClientSingleton = () => {
  return new PrismaClient(
    resolvedDatasourceUrl
      ? {
          datasources: {
            db: {
              url: resolvedDatasourceUrl,
            },
          },
        }
      : undefined
  )
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
