import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

import prismaClient from '@/utils/client';

jest.mock('@/utils/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}));

const prismaMock = prismaClient as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

afterEach(() => {
  jest.clearAllMocks();
});

export { prismaMock };
