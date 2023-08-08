import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '@/utils/client';

jest.mock('@/utils/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
