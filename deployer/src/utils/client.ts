import {
  DirectSecp256k1HdWallet,
  DirectSecp256k1Wallet,
} from '@cosmjs/proto-signing';
import {
  SigningCosmWasmClient,
  CosmWasmClient,
} from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';
import { CONFIG } from '../config/config';
import { fromHex, toHex } from '@cosmjs/encoding';

export class CosmWasmClientManager {
  private static instance: CosmWasmClientManager;
  private signingClient?: SigningCosmWasmClient;
  private queryClient?: CosmWasmClient;
  private wallet?: DirectSecp256k1HdWallet | DirectSecp256k1Wallet;

  private constructor() {}

  public static getInstance(): CosmWasmClientManager {
    if (!CosmWasmClientManager.instance) {
      CosmWasmClientManager.instance = new CosmWasmClientManager();
    }
    return CosmWasmClientManager.instance;
  }

  async initializeClients(mnemonic?: string, privateKey?: string) {
    if (!mnemonic && !privateKey) {
      throw new Error('Please provide either mnemonic or privateKey');
    } else if (mnemonic) {
      this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    } else if (privateKey) {
      const pk = fromHex(privateKey);
      this.wallet = await DirectSecp256k1Wallet.fromKey(pk, 'mantra');
    }

    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    this.signingClient = await SigningCosmWasmClient.connectWithSigner(
      CONFIG.RPC_ENDPOINT,
      this.wallet,
      { gasPrice: GasPrice.fromString(CONFIG.GAS_PRICE) },
    );

    this.queryClient = await CosmWasmClient.connect(CONFIG.RPC_ENDPOINT);
  }

  async getSigningClient(): Promise<SigningCosmWasmClient> {
    if (!this.signingClient) {
      throw new Error('Signing client not initialized');
    }
    return this.signingClient;
  }

  async getWalletAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    const [account] = await this.wallet.getAccounts();
    return account.address;
  }
}
