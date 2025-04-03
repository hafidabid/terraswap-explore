import { readFileSync } from 'fs';
import { CosmWasmClientManager } from './client';

export class ContractDeployer {
  protected clientManager: CosmWasmClientManager;

  constructor() {
    this.clientManager = CosmWasmClientManager.getInstance();
  }

  async deployContract(
    wasmPath: string,
    initMsg: any,
    label: string,
  ): Promise<{
    codeId: number;
    contractAddress: string;
  }> {
    const client = await this.clientManager.getSigningClient();
    const walletAddress = await this.clientManager.getWalletAddress();

    console.log('Wallet address: ', walletAddress);
    console.log('Wallet balance: ', await client.getBalance(walletAddress, 'uom'));
    console.log('Uploading contract...');
    const wasmCode = readFileSync(wasmPath);
    const uploadReceipt = await client.upload(
      walletAddress,
      wasmCode,
      'auto',
      'Upload CosmWasm contract',
    );

    console.log(`Contract uploaded with Code ID: ${uploadReceipt.codeId}`);

    console.log('Instantiating contract...');
    const instantiateReceipt = await client.instantiate(
      walletAddress,
      uploadReceipt.codeId,
      initMsg,
      label,
      'auto',
    );

    console.log(
      `Contract instantiated at address: ${instantiateReceipt.contractAddress}`,
    );

    return {
      codeId: uploadReceipt.codeId,
      contractAddress: instantiateReceipt.contractAddress,
    };
  }
}
