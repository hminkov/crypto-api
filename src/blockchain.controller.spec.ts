import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

//TODO: Fix this test
describe('AppController', () => {
  let appController: BlockchainController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [BlockchainService],
    }).compile();

    appController = app.get<BlockchainController>(BlockchainController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {});
  });
});
