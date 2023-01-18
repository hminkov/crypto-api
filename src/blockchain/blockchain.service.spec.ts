import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { appendFile } from 'fs';
import { BlockchainService } from './blockchain.service';
import { BlockTransaction } from './entities/blocktransaction.entity';
import { LatestBlock } from './entities/latestblock.entity';
import { BlockTransactionRepository } from './repository/blocktransaction.repository';
import { LatestBlockRepository } from './repository/latestblock.repository';

describe('BlockchainService', () => {
    let blockchainServiceMock: Partial<BlockchainService>;
    let blockTransactionRepositoryMock: BlockTransactionRepository;
    let latestBlockRepositoryMock: LatestBlockRepository;

  beforeEach(async () => {
    const latestBlock: LatestBlock[] = [];
    const blockTransaction: BlockTransaction[] = [];

    blockTransactionRepositoryMock = {
        const blockTransaction = { blockHeight: number,
            transactionHash: string,
            sender: string,
            receiver: string,
            amountSent: number,} as BlockTransaction;
    }
        
    }
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
            provide: BlockchainService,
            useValue: blockchainServiceMock,
        },
        BlockTransactionRepository,
        LatestBlockRepository,
      ],
    }).compile();
    // const app = moduleRef.createNestApplication();
    // await app.init();
    blockTransactionRepository = moduleRef.get<BlockTransactionRepository>(
      BlockTransactionRepository,
    );
    latestBlockRepository = moduleRef.get<LatestBlockRepository>(
      LatestBlockRepository,
    );
    blockchainServiceMock = moduleRef.get<BlockchainService>(BlockchainService);
  });
  

//   describe('getBlockDataFromAPI', () => {
//     it('should call the BTC Testnet API and return the latest block information', async () => {
//       // Set up the mock response from the API
//       const bestBlockHash =
//         '000000000000000002e94817f248c948f6d9a8c817f8f8f8f8f8f8f8f8f8f8f';});

//       const latestBlockCtx = {
//         hash: '000000000000000002e94817f248c948f6d9a8c817f8f8f8f8f8f8f8f8f8f8f',
//         height: 615295,
//       };

//       axiosGetMock.mockResolvedValue({ data: latestBlockCtx });

//       // Call the method and check the result
//       const result = await blockchainService.getBlockDataFromAPI();
//       expect(result).toEqual(latestBlockCtx);
//       expect(axios.get).toHaveBeenCalledWith(
//         'https://api.tatum.io/v3/bitcoin/info?type=testnet',
//         { headers: { 'x-api-key': process.env.DB_API_KEY } },
//       );
//       expect(axios.get).toHaveBeenCalledWith(
//         `https://api.tatum.io/v3/bitcoin/block/${bestBlockHash}?type=testnet`,
//         options,
//       );
//       expect(latestBlockRepository.save).toHaveBeenCalledWith([latestBlock]);
//       expect(cacheManager.set).toHaveBeenCalledWith(
//         'latest-block',
//         latestBlock,
//         60,
//       );
//     });
//   });
  describe('storeBlockDataInDB', () => {
    it('should store block data in the database and cache', async () => {
      const latestBlockCtx = {
        height: 123,
        nTx: 2,
        txs: [{ hash: '123' }, { hash: '456' }],
      };
      const firstTransaction = {
        inputs: [{ coin: { address: 'abc' } }],
        outputs: [{ address: 'def', value: 0.1 }],
      };
      latestBlockCtx.txs[1] = firstTransaction;
      await service.storeBlockDataInDB(latestBlockCtx);
      expect(blockTransactionRepository.save).toHaveBeenCalledWith([
        new BlockTransaction(
          latestBlockCtx.height,
          firstTransaction.hash,
          0.1,
          'abc',
          'def',
        ),
      ]);
      expect(cacheManager.set).toHaveBeenCalledWith(
        firstTransaction.hash,
        new BlockTransaction(
          latestBlockCtx.height,
          firstTransaction.hash,
          0.1,
          'abc',
          'def',
        ),
        60,
      );
    });

//     it('should throw an error if no transactions found', async () => {
//       const latestBlockCtx = {
//         height: 123,
//         nTx: 1,
//         txs: [],
//       };
//       await expect(service.storeBlockDataInDB(latestBlockCtx)).rejects.toThrow(
//         'storeBlockDataInDB: No transactions found',
//       );
//     });
//   });
// });
