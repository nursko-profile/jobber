import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma-clients/jobber-auth';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static pool: Pool | null = null;

  constructor() {
    const datasourceUrl = process.env.AUTH_DATABASE_URL;

    if (!datasourceUrl) {
      throw new Error('AUTH_DATABASE_URL environment variable is not set.');
    }

    const pool = PrismaService.pool ?? new Pool({ connectionString: datasourceUrl });
    PrismaService.pool = pool;

    super({ adapter: new PrismaPg(pool) });
  }

  async onModuleInit() {
    await super.$connect();
  }

  async onModuleDestroy() {
    await super.$disconnect();
    await PrismaService.pool?.end();
    PrismaService.pool = null;
  }
}
