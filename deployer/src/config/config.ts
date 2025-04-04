export const CONFIG = {
  RPC_ENDPOINT: 'https://rpc.dukong.mantrachain.io',
  CHAIN_PREFIX: 'mantra',
  GAS_PRICE: '0.01uom',
  CONTRACTS: {
    CW20: {
      PATH: './terraswap_token.wasm',
      INIT_MSG: {
        name: 'PKMT April',
        symbol: 'PKMT',
        decimals: 6,
        initial_balances: [
          {
            address: 'mantra1grp86uq4klhhxxrlajxh8kj23tmqt3cvxawcfk',
            amount: '100000000000',
          },
          {
            address: 'mantra1hg9cun8u72nvpwk0kmv6mk63avqzllq4s4x80a',
            amount: '100000000000',
          },
        ],
      },
    },
    FACTORY: {
      PATH: './terraswap_factory.wasm',
      INIT_MSG: {
        pair_code_id: 661,
        token_code_id: 655,
      },
    },
    PAIR: {
      PATH: './terraswap_pair.wasm',
      INIT_MSG: {
        asset_infos: [
          {
            native_token: {
             denom:'uom'
            },
          },
          {
            token: {
              contract_addr:
                'mantra15meyxukpxk665ggwg9kq249j5x40my95h2crty75vdpct4qq43lswslegs',
            },
          }
        ],
        token_code_id: 655,
        asset_decimals: [6, 6],
      },
    },
    ROUTER: {
      PATH: './terraswap_router.wasm',
      INIT_MSG: {
        terraswap_factory: 'mantra10kpnaly9j3re4dfnq78kykuajqfxgfuzgr94uvdza6jehe0cps6qk8c9d7',
      },
    },
  },
};
