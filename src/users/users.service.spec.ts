import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
            role: { findFirst: jest.fn() },
            jabatan: { findMany: jest.fn() },
            komisi: { findMany: jest.fn() },
            fraksi: { findMany: jest.fn() },
            akd: { findMany: jest.fn() },
            userAkd: { create: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
