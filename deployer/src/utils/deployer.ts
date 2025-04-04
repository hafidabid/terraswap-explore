import { readFileSync } from 'fs';
import { CosmWasmClientManager } from './client';

export class ContractDeployer {
  protected clientManager: CosmWasmClientManager;

  constructor() {
    this.clientManager = CosmWasmClientManager.getInstance();
  }

  async uploadContract(wasmPath: string): Promise<number> {
    const client = await this.clientManager.getSigningClient();
    const walletAddress = await this.clientManager.getWalletAddress();

    // check address and balance
    console.log('address: ', walletAddress)
    console.log('balance: ', await client.getBalance(walletAddress, 'uom'))

    console.log(`\n📤 Uploading contract: ${wasmPath}`);
    const wasmCode = readFileSync(wasmPath);
    const uploadReceipt = await client.upload(walletAddress, wasmCode, 'auto', 'Upload contract');
    console.log(`✅ Uploaded. Code ID: ${uploadReceipt.codeId}`);

    return uploadReceipt.codeId;
  }

  async instantiateContract(
    codeId: number,
    initMsg: any,
    label: string
  ): Promise<string> {
    const client = await this.clientManager.getSigningClient();
    const walletAddress = await this.clientManager.getWalletAddress();

    console.log(`\n⚙️ Instantiating contract (codeId: ${codeId})`);
    const receipt = await client.instantiate(walletAddress, codeId, initMsg, label, 'auto');
    console.log(`🚀 Contract instantiated at: ${receipt.contractAddress}`);
    return receipt.contractAddress;
  }

  async uploadAndInstantiate(
    wasmPath: string,
    initMsg: any,
    label: string
  ): Promise<{
    codeId: number;
    contractAddress: string;
  }> {
    const codeId = await this.uploadContract(wasmPath);
    const contractAddress = await this.instantiateContract(codeId, initMsg, label);
    return { codeId, contractAddress };
  }
}
