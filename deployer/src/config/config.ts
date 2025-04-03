export const CONFIG = {
  RPC_ENDPOINT: 'https://rpc.dukong.mantrachain.io',
  CHAIN_PREFIX: 'mantra',
  GAS_PRICE: '0.01uom',
  CONTRACTS: {
    CW20: {
      PATH: './terraswap_token.wasm',
      INIT_MSG: {
        name: 'ABCX Alphabet',
        symbol: 'ABCX',
        decimals: 6,
        initial_balances: [
          {
            address: 'mantra1grp86uq4klhhxxrlajxh8kj23tmqt3cvxawcfk',
            amount: '100000000000',
          },
          {
            address: 'mantra1hg9cun8u72nvpwk0kmv6mk63avqzllq4s4x80a',
            amount: '100000000000'
          }
        ],
      },
    },
    FACTORY: {
      PATH: './terraswap_factory.wasm',
      INIT_MSG: {
        name: 'ABCX Alphabet',
        symbol: 'ABCX',
        decimals: 6,
        initial_balances: [
          {
            address: 'mantra1grp86uq4klhhxxrlajxh8kj23tmqt3cvxawcfk',
            amount: '100000000000',
          },
          {
            address: 'mantra1hg9cun8u72nvpwk0kmv6mk63avqzllq4s4x80a',
            amount: '100000000000'
          }
        ],
      },
    },
    PAIR :{ 
      PATH: './terraswap_pair.wasm',
      INIT_MSG: {
        name: 'ABCX Alphabet',
        symbol: 'ABCX',
        decimals: 6,
        initial_balances: [
          {
            address: 'mantra1grp86uq4klhhxxrlajxh8kj23tmqt3cvxawcfk',
            amount: '100000000000',
          },
          {
            address: 'mantra1hg9cun8u72nvpwk0kmv6mk63avqzllq4s4x80a',
            amount: '100000000000'
          }
        ],
      },
    },
    ROUTER: {
      PATH: './terraswap_router.wasm',
      INIT_MSG: {
        name: 'ABCX Alphabet',
        symbol: 'ABCX',
        decimals: 6,
        initial_balances: [
          {
            address: 'mantra1grp86uq4klhhxxrlajxh8kj23tmqt3cvxawcfk',
            amount: '100000000000',
          },
          {
            address: 'mantra1hg9cun8u72nvpwk0kmv6mk63avqzllq4s4x80a',
            amount: '100000000000'
          }
        ],
      },
    }
  },
};
