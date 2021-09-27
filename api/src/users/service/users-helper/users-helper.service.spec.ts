import { Test, TestingModule } from '@nestjs/testing';
import { UsersHelperService } from './users-helper.service';

describe('UsersHelperService', () => {
  let service: UsersHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersHelperService],
    }).compile();

    service = module.get<UsersHelperService>(UsersHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
