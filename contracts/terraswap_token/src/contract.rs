use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult,
};
use cw2::set_contract_version;
use cw20_base::contract::{
    execute as cw20_execute, instantiate as cw20_instantiate, query as cw20_query,
};
use cw20_base::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};

const CONTRACT_NAME: &str = "quvault:cw20-token";
const CONTRACT_VERSION: &str = "0.1.0";

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    cw20_instantiate(deps, env, info, msg).map_err(|e| StdError::generic_err(e.to_string()))
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    cw20_execute(deps, env, info, msg).map_err(|e| StdError::generic_err(e.to_string()))
}

#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    cw20_query(deps, env, msg)
}
