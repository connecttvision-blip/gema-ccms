import { PrismaClient } from '../../generated/prisma/client';

export function withTenant(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = {
            ...args.where,
            ...(tenantId ? { tenantId } : {}),
          };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = {
            ...args.where,
            ...(tenantId ? { tenantId } : {}),
          };
          return query(args);
        },
        async create({ args, query }) {
  args.data = {
    ...(args.data as any),
    tenantId,
  } as any;
  return query(args);
}
      },
    },
  });
}