import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

import { prismaClient } from '@/utils/client';

jest.mock('@/utils/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

export const prismaMock = prismaClient as DeepMockProxy<PrismaClient>;
