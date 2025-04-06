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
      cw20Result = await deployer.uploadAndInstantiate(
        CONFIG.CONTRACTS.CW20.PATH,
        CONFIG.CONTRACTS.CW20.INIT_MSG,
        'QuVault CW20 Token Contract',
      );
    } else if (deployTarget === 'factory') {
      console.log('\n=== Deploying Factory Contract Only ===');
      factoryResult = await deployer.uploadAndInstantiate(
        CONFIG.CONTRACTS.FACTORY.PATH,
        CONFIG.CONTRACTS.FACTORY.INIT_MSG,
        'QuVault Factory Contract',
      );
    } else if (deployTarget === 'pair') {
      console.log('\n=== Deploying Pair Contract Only ===');
      factoryResult = await deployer.uploadAndInstantiate(
        CONFIG.CONTRACTS.PAIR.PATH,
        CONFIG.CONTRACTS.PAIR.INIT_MSG,
        'QuVault Pair Contract',
      );
    } else if (deployTarget === 'router') {
      console.log('\n=== Deploying Router Contract Only ===');
      factoryResult = await deployer.uploadAndInstantiate(
        CONFIG.CONTRACTS.ROUTER.PATH,
        CONFIG.CONTRACTS.ROUTER.INIT_MSG,
        'QuVault Router Contract',
      );
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

async function uploadPair() {
  // Initialize the client manager
  const clientManager = CosmWasmClientManager.getInstance();
  if (process.env.PRIVATE_KEY) {
    await clientManager.initializeClients(undefined, process.env.PRIVATE_KEY);
  } else {
    await clientManager.initializeClients(process.env.MNEMONIC, undefined);
  }

  const deployer = new ContractDeployer();

  const factoryResult = await deployer.uploadContract(
    CONFIG.CONTRACTS.PAIR.PATH,
  );

  console.log(factoryResult);
}

async function instantiatePair(code: number) {
  const clientManager = CosmWasmClientManager.getInstance();
  if (process.env.PRIVATE_KEY) {
    await clientManager.initializeClients(undefined, process.env.PRIVATE_KEY);
  } else {
    await clientManager.initializeClients(process.env.MNEMONIC, undefined);
  }

  const deployer = new ContractDeployer();

  const factoryResult = await deployer.instantiateContract(
    code,
    CONFIG.CONTRACTS.PAIR.INIT_MSG,
    'QuVault Pair Contract',
  );

  console.log(factoryResult);
}

const ROUTER_ADDR =
  'mantra1yayejfkt9kg7xeea9h4d7v7q2etjlmvqlwxenj55v5sfdpstwm7qy6ve32';
const PAIR_ADDR =
  'mantra1gpykznuwmra4k0jjwt4hv590gpyl4xhdh75tr4my3d2t0lhyuzjqkv4qr3';
const FACTORY_ADDR =
  'mantra10kpnaly9j3re4dfnq78kykuajqfxgfuzgr94uvdza6jehe0cps6qk8c9d7';

async function tokenCheck(
  clientManager: CosmWasmClientManager,
  myAddress: string,
  tokenAddresses: string[],
) {
  const client = await clientManager.getSigningClient();

  // show information of current wallet balance
  console.log('my address: ', myAddress);
  console.log('current balance: ', await client.getBalance(myAddress, 'uom'));
  console.log('current balance: ', await client.getBalance(myAddress, 'ust'));
  console.log('\n');

  for (const tokenAddr of tokenAddresses) {
    if (!tokenAddr) {
      console.warn('Skipping empty token address');
      continue;
    }

    const tokenInfo = await client.queryContractSmart(tokenAddr, {
      token_info: {},
    });
    // console.log('token info: ', tokenInfo);
    const myBalance = await client.queryContractSmart(tokenAddr, {
      balance: { address: myAddress },
    });
    console.log('token balance: ', myBalance);
    console.log('total supply: ', tokenInfo.total_supply);
    console.log('token decimals: ', tokenInfo.decimals);
    console.log('token name: ', tokenInfo.name);
    console.log('token symbol: ', tokenInfo.symbol);

    // get the token owner information
    const tokenOwner = await client.queryContractSmart(tokenAddr, {
      marketing_info: {},
    });
    console.log('token owner: ', tokenOwner);
    console.log('============================\n');
  }
}

async function provideLiquidity(execute: boolean, pairAddr?: string) {
  const user_pk = process.env.USER_PRIVATEKEY;
  const tokenAddresses = [
    process.env.USER_TOKEN_ADDR0 ?? '',
    process.env.USER_TOKEN_ADDR1 ?? '',
    process.env.USER_TOKEN_ADDR2 ?? '',
    process.env.USER_TOKEN_ADDR3 ?? '',
  ];
  const [token0Addr, token1Addr, token2Addr, token3Addr] = tokenAddresses;

  const clientManager = CosmWasmClientManager.getInstance();
  await clientManager.initializeClients(undefined, user_pk);

  const walletAddr = await clientManager.getWalletAddress();

  await tokenCheck(clientManager, walletAddr, tokenAddresses);

  const client = await clientManager.getSigningClient();

  const pAddr = pairAddr ?? PAIR_ADDR;

  // try to check current liquidity
  const liq0 = await client.queryContractSmart(pAddr, {
    pool: {},
  });

  console.log('liquidity before: ', JSON.stringify(liq0, null, 2));

  // provide liquidity
  if (execute) {
    const result = await client.execute(
      walletAddr,
      pAddr,
      {
        provide_liquidity: {
          assets: [
            {
              info: {
                token: {
                  contract_addr: token1Addr,
                },
              },
              amount: '500000',
            },
            {
              info: {
                native_token: {
                  denom: 'uom',
                },
              },
              amount: '100000',
            },
          ],
        },
      },
      'auto',
      'provide liquidity',
      [
        {
          denom: 'uom',
          amount: '100000',
        },
      ],
    );

    console.log('result: ', {
      hash: result.transactionHash,
      gasUsed: result.gasUsed,
      gasWanted: result.gasWanted,
    });

    // after creating liquidity, try to check current liquidity
    const liq1 = await client.queryContractSmart(pAddr, {
      pool: {},
    });

    console.log('liquidity after: ', JSON.stringify(liq1, null, 2));
  }
}

async function createLiquidity() {
  const user_pk = process.env.USER_PRIVATEKEY;
  const tokenAddresses = [
    process.env.USER_TOKEN_ADDR0 ?? '',
    process.env.USER_TOKEN_ADDR1 ?? '',
    process.env.USER_TOKEN_ADDR2 ?? '',
    process.env.USER_TOKEN_ADDR3 ?? '',
  ];
  const [token0Addr, token1Addr, token2Addr, token3Addr] = tokenAddresses;

  const clientManager = CosmWasmClientManager.getInstance();
  await clientManager.initializeClients(undefined, user_pk);

  const walletAddr = await clientManager.getWalletAddress();

  await tokenCheck(clientManager, walletAddr, tokenAddresses);

  const client = await clientManager.getSigningClient();

  // try to check current liquidity
  const liq0 = await client.queryContractSmart(PAIR_ADDR, {
    pool: {},
  });

  console.log('liquidity before: ', JSON.stringify(liq0, null, 2));

  // create liquidity
  const tx = await client.execute(
    walletAddr,
    FACTORY_ADDR,
    {
      create_pair: {
        assets: [
          {
            info: {
              token: {
                contract_addr: token1Addr,
              },
            },
            amount: '0',
          },
          {
            info: {
              native_token: {
                denom: 'uom',
              },
            },
            amount: '0',
          },
        ],
      },
    },
    'auto',
    'create liquidity on terraswap-mantra',
    // [
    //   {
    //     denom: 'uom',
    //     amount: '1',
    //   },
    // ],
  );

  console.log('tx success with', tx.gasUsed, tx.gasWanted, tx.transactionHash);

  // try to check current liquidity
  const liq1 = await client.queryContractSmart(PAIR_ADDR, {
    pool: {},
  });

  console.log('liquidity after: ', JSON.stringify(liq1, null, 2));
}

async function tokenAssignment(
  execute: boolean,
  tokenTarget: string,
  pairAddr?: string,
) {
  const clientManager = CosmWasmClientManager.getInstance();
  await clientManager.initializeClients(undefined, process.env.USER_PRIVATEKEY);

  const walletAddr = await clientManager.getWalletAddress();

  await tokenCheck(clientManager, walletAddr, [tokenTarget]);

  // increase allowance
  const client = await clientManager.getSigningClient();
  if (execute) {
    const tx = await client.execute(
      walletAddr,
      tokenTarget,
      {
        increase_allowance: {
          spender: pairAddr ?? PAIR_ADDR,
          amount: '10000000',
        },
      },
      'auto',
      'increase allowance',
      [],
    );

    console.log('result: ', tx);
  }

  // try to check current allowance
  const allowance = await client.queryContractSmart(tokenTarget, {
    allowance: {
      owner: walletAddr,
      spender: PAIR_ADDR,
    },
  });

  console.log('allowance: ', JSON.stringify(allowance, null, 2));
}

async function nativeTokenDecimals() {
  const clientManager = CosmWasmClientManager.getInstance();
  await clientManager.initializeClients(undefined, process.env.USER_PRIVATEKEY);

  const client = await clientManager.getSigningClient();
  const walletAddr = await clientManager.getWalletAddress();
  // add uom first
  // await client.execute(walletAddr, FACTORY_ADDR, {
  //   add_native_token_decimals: {
  //     denom: 'uom',
  //     decimals: 6,
  //   }
  // }, 'auto', 'add uom');

  const res = await client.queryContractSmart(FACTORY_ADDR, {
    native_token_decimals: {
      denom: 'uom',
    },
  });

  console.log('res: ', res);
}

async function seePairs() {
  const clientManager = CosmWasmClientManager.getInstance();
  await clientManager.initializeClients(undefined, process.env.USER_PRIVATEKEY);

  const client = await clientManager.getSigningClient();
  const walletAddr = await clientManager.getWalletAddress();

  const res = await client.queryContractSmart(FACTORY_ADDR, {
    pairs: {},
  });

  console.log('res: ', JSON.stringify(res, null, 2));
}

async function performSwapNative(pairAddr: string) {
  const clientManager = CosmWasmClientManager.getInstance();
  await clientManager.initializeClients(undefined, process.env.USER_PRIVATEKEY);

  const client = await clientManager.getSigningClient();
  const walletAddr = await clientManager.getWalletAddress();

  const res = await client.execute(
    walletAddr,
    pairAddr,
    {
      swap: {
        offer_asset: {
          info: {
            token: {
              contract_addr:
                'mantra1dc0mapjpm7nzmzckg4h3x2z09nw227tuqjy50jjn5dzcmupez59s2w5s4w',
            },
          },
          amount: '10000',
        },
        // to: 'mantra1dc0mapjpm7nzmzckg4h3x2z09nw227tuqjy50jjn5dzcmupez59s2w5s4w',
      },
    },
    'auto',
    'swap',
    [
      {
        denom: 'uom',
        amount: '10000',
      },
    ],
  );

  console.log('swap result', {
    gasUsed: res.gasUsed,
    gasWanted: res.gasWanted,
    transactionHash: res.transactionHash,
  });
}

async function performSwapToken(tokenAddr: string, pairAddr: string) {
  const clientManager = CosmWasmClientManager.getInstance();
  await clientManager.initializeClients(undefined, process.env.USER_PRIVATEKEY);

  const client = await clientManager.getSigningClient();
  const walletAddr = await clientManager.getWalletAddress();

  const res = await client.execute(
    walletAddr,
    tokenAddr,
    {
      send: {
        contract: pairAddr,
        amount: '25000',
        msg: Buffer.from(JSON.stringify({ swap: {
          offer_asset: {
            info: {
              token: {
                contract_addr: tokenAddr,
              },
            },
            amount: '25000',
          },
        } })).toString('base64'),
      },
    },
    'auto',
    'swap',
    [],
  );

  console.log('swap result', {
    gasUsed: res.gasUsed,
    gasWanted: res.gasWanted,
    transactionHash: res.transactionHash,
  });
}

async function withdrawLiquidity(pairAddr: string) {
  const clientManager = CosmWasmClientManager.getInstance();
  await clientManager.initializeClients(undefined, process.env.USER_PRIVATEKEY);
  const tokenAddresses = [
    process.env.USER_TOKEN_ADDR0 ?? '',
    process.env.USER_TOKEN_ADDR1 ?? '',
    process.env.USER_TOKEN_ADDR2 ?? '',
    process.env.USER_TOKEN_ADDR3 ?? '',
  ];

  const client = await clientManager.getSigningClient();
  const walletAddr = await clientManager.getWalletAddress();

  console.log('wallet address: ', walletAddr);
  console.log('before withdraw');
  await tokenCheck(clientManager, walletAddr, tokenAddresses);

  const res = await client.execute(
    walletAddr,
    pairAddr,
    {
      receive: {
        sender:
          'mantra1apfec7qmtsmr0yjqf5dskxj8vfpfm6f9hc0tndcwycsl8e9v6wnq8ddk4t',
        amount: '5000',
        msg: Buffer.from(
          JSON.stringify({
            withdraw_liquidity: {},
          }),
        ).toString('base64'),
      },
    },
    'auto',
    'withdraw',
    [],
  );

  console.log('withdraw result', {
    gasUsed: res.gasUsed,
    gasWanted: res.gasWanted,
    transactionHash: res.transactionHash,
  });

  console.log('after withdraw');
  await tokenCheck(clientManager, walletAddr, tokenAddresses);
}

main().catch(console.error);
// uploadPair().catch(console.error)

// instantiatePair(661).catch(console.error);
// tokenAssignment(
//   'mantra1dc0mapjpm7nzmzckg4h3x2z09nw227tuqjy50jjn5dzcmupez59s2w5s4w',
//   'mantra103plzlnwx34wheljlcxghsynzefvg6cjsxsk0yhmll5dzjywhgpsunqqk8',
// )
//   .then((r) => {
//     provideLiquidity(
//       true,
//       'mantra103plzlnwx34wheljlcxghsynzefvg6cjsxsk0yhmll5dzjywhgpsunqqk8',
//     ).catch(console.error);
//   })
//   .catch(console.error);

// seePairs().catch(console.error);
// createLiquidity().catch(console.error);
// nativeTokenDecimals().catch(console.error);

// performSwapNative(
//   'mantra103plzlnwx34wheljlcxghsynzefvg6cjsxsk0yhmll5dzjywhgpsunqqk8',
// )
//   .then((r) => {
//     tokenAssignment(
//       false,
//       'mantra1dc0mapjpm7nzmzckg4h3x2z09nw227tuqjy50jjn5dzcmupez59s2w5s4w',
//       'mantra103plzlnwx34wheljlcxghsynzefvg6cjsxsk0yhmll5dzjywhgpsunqqk8',
//     ).catch(console.error);
//   })
//   .catch(console.error);

// performSwapToken(
//   'mantra1dc0mapjpm7nzmzckg4h3x2z09nw227tuqjy50jjn5dzcmupez59s2w5s4w',
//   'mantra103plzlnwx34wheljlcxghsynzefvg6cjsxsk0yhmll5dzjywhgpsunqqk8',
// )
//   .then((r) => {
//     tokenAssignment(
//       false,
//       'mantra1dc0mapjpm7nzmzckg4h3x2z09nw227tuqjy50jjn5dzcmupez59s2w5s4w',
//       'mantra103plzlnwx34wheljlcxghsynzefvg6cjsxsk0yhmll5dzjywhgpsunqqk8',
//     ).catch(console.error);
//   })
//   .catch(console.error);

// provideLiquidity(
//   false,
//   'mantra103plzlnwx34wheljlcxghsynzefvg6cjsxsk0yhmll5dzjywhgpsunqqk8',
// ).catch(console.error);

// withdrawLiquidity(
//   'mantra103plzlnwx34wheljlcxghsynzefvg6cjsxsk0yhmll5dzjywhgpsunqqk8',
// ).catch(console.error);
