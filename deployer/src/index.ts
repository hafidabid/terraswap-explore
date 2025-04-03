import { config } from 'dotenv';
import { CosmWasmClientManager } from './utils/client';
import { ContractDeployer } from './utils/deployer';
import { CONFIG } from './config/config';

config();

async function main() {
  // Retrieve deployment target argument (e.g., "factory", "cw20", "launchpad")
  const deployTarget = process.argv[2]?.toLowerCase();

  if (!process.env.MNEMONIC && !process.env.PRIVATE_KEY) {
    throw new Error('MNEMONIC environment variable is required');
  }

  const AdminAddress = process.env.ADMIN_ADDRESS;
  const MerchantAddress = process.env.MERCHANT_ADDRESS;

  if (!(AdminAddress && MerchantAddress)) {
    throw new Error('ADMIN_ADDRESS && MERCHANT_ADDRESS are required in .env');
  }

  // Initialize the client manager
  const clientManager = CosmWasmClientManager.getInstance();
  if (process.env.PRIVATE_KEY) {
    await clientManager.initializeClients(undefined, process.env.PRIVATE_KEY);
  } else {
    await clientManager.initializeClients(process.env.MNEMONIC, undefined);
  }

  const deployer = new ContractDeployer();

  try {
    // Variables to store deployment results
    let cw20Result, launchpadResult, factoryResult;

    // No target or "all" means deploy all contracts sequentially.
    if (deployTarget === 'cw20') {
      console.log('\n=== Deploying CW20 Contract Only ===');
      cw20Result = await deployer.deployContract(
        CONFIG.CONTRACTS.CW20.PATH,
        CONFIG.CONTRACTS.CW20.INIT_MSG,
        'QuVault CW20 Token Contract',
      );
    } else if (deployTarget === 'factory') {
      console.log('\n=== Deploying Factory Contract Only ===');
      factoryResult = await deployer.deployContract(
        CONFIG.CONTRACTS.FACTORY.PATH,
        CONFIG.CONTRACTS.FACTORY.INIT_MSG,
        'QuVault Factory Contract',
      )
    } else if (deployTarget === 'pair') {
      console.log('\n=== Deploying Pair Contract Only ===');
      factoryResult = await deployer.deployContract(
        CONFIG.CONTRACTS.PAIR.PATH,
        CONFIG.CONTRACTS.PAIR.INIT_MSG,
        'QuVault Pair Contract',
      )
    }else if (deployTarget === 'router') {
      console.log('\n=== Deploying Router Contract Only ===');
      factoryResult = await deployer.deployContract(
        CONFIG.CONTRACTS.ROUTER.PATH,
        CONFIG.CONTRACTS.ROUTER.INIT_MSG,
        'QuVault Router Contract',
      )
    } else {
      console.error(
        'Invalid deployment target. Use one of: all, cw20, launchpad, factory',
      );
      process.exit(1);
    }

    // Log deployment results
    console.log('\n=== Deployment Summary ===');
    if (cw20Result) console.log('CW20 Contract:', cw20Result);
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
