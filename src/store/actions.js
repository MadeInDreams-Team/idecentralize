// WEB3
export function web3Loaded(connection) {
  return {
    type: 'WEB3_LOADED',
    connection
  }
}

export function web3AccountLoaded(account) {
  return {
    type: 'WEB3_ACCOUNT_LOADED',
    account
  }
}

// TOKEN
export function tokenLoaded(contract) {
  return {
    type: 'TOKEN_LOADED',
    contract
  }
}

// EXCHANGE
export function exchangeLoaded(contract) {
  return {
    type: 'EXCHANGE_LOADED',
    contract
  }
}
//////////////////////////////////////////////// DEFI
export function stackingLoaded(contract) {
  return {
    type: 'STACKING_LOADED',
    contract
  }
}
export function stacks(data) {
  return {
    type: 'STACKS',
    data
  }
}
export function stackAmountChanged(amount) {
  return {
    type: 'STACKS_AMOUNT_CHANGED',
    amount
  }
}
/////////////////////////////////////////////////////////// FOR ORDERS ON SELECTED TOKEN
export function cancelledOrdersLoaded(cancelledOrders) {
  return {
    type: 'CANCELLED_ORDERS_LOADED',
    cancelledOrders
  }
}

export function filledOrdersLoaded(filledOrders) {
  return {
    type: 'FILLED_ORDERS_LOADED',
    filledOrders
  }
}

export function allOrdersLoaded(allOrders) {
  return {
    type: 'ALL_ORDERS_LOADED',
    allOrders
  }
}
//////////////////////////////////////////////////////// FOR ALL ORDERS HISTORY
export function totalOrdersLoaded(totalOrders) {
  return {
    type: 'TOTAL_ORDERS_LOADED',
    totalOrders
  }
}
export function totalOrdersCancelled(totalOrdersCancelled) {
  return {
    type: 'TOTAL_ORDERS_CANCELLED_LOADED',
    totalOrdersCancelled
  }
}
export function totalOrdersFilled(totalOrdersFilled) {
  return {
    type: 'TOTAL_ORDERS_FILLED',
    totalOrdersFilled
  }
}

// Cancel Order
export function orderCancelling() {
  return {
    type: 'ORDER_CANCELLING'
  }
}

export function orderCancelled(order) {
  return {
    type: 'ORDER_CANCELLED',
    order
  }
}

// Fill Order
export function orderFilling() {
  return {
    type: 'ORDER_FILLING'
  }
}

export function orderFilled(order) {
  return {
    type: 'ORDER_FILLED',
    order
  }
}

// Balances
export function etherBalanceLoaded(balance) {
  return {
    type: 'ETHER_BALANCE_LOADED',
    balance
  }
}

export function tokenBalanceLoaded(balance) {
  return {
    type: 'TOKEN_BALANCE_LOADED',
    balance
  }
}

export function exchangeEtherBalanceLoaded(balance) {
  return {
    type: 'EXCHANGE_ETHER_BALANCE_LOADED',
    balance
  }
}

export function exchangeTokenBalanceLoaded(balance) {
  return {
    type: 'EXCHANGE_TOKEN_BALANCE_LOADED',
    balance
  }
}

export function balancesLoaded() {
  return {
    type: 'BALANCES_LOADED'
  }
}

export function balancesLoading() {
  return {
    type: 'BALANCES_LOADING'
  }
}

export function etherDepositAmountChanged(amount) {
  return {
    type: 'ETHER_DEPOSIT_AMOUNT_CHANGED',
    amount
  }
}

export function etherWithdrawAmountChanged(amount) {
  return {
    type: 'ETHER_WITHDRAW_AMOUNT_CHANGED',
    amount
  }
}

export function tokenDepositAmountChanged(amount) {
  return {
    type: 'TOKEN_DEPOSIT_AMOUNT_CHANGED',
    amount
  }
}

export function tokenWithdrawAmountChanged(amount) {
  return {
    type: 'TOKEN_WITHDRAW_AMOUNT_CHANGED',
    amount
  }
}

// Buy Order
export function buyOrderAmountChanged(amount) {
  return {
    type: 'BUY_ORDER_AMOUNT_CHANGED',
    amount
  }
}

export function buyOrderPriceChanged(price) {
  return {
    type: 'BUY_ORDER_PRICE_CHANGED',
    price
  }
}

export function buyOrderMaking(price) {
  return {
    type: 'BUY_ORDER_MAKING'
  }
}

// Generic Order
export function orderMade(order) {
  return {
    type: 'ORDER_MADE',
    order
  }
}

// Sell Order
export function sellOrderAmountChanged(amount) {
  return {
    type: 'SELL_ORDER_AMOUNT_CHANGED',
    amount
  }
}

export function sellOrderPriceChanged(price) {
  return {
    type: 'SELL_ORDER_PRICE_CHANGED',
    price
  }
}

export function sellOrderMaking(price) {
  return {
    type: 'SELL_ORDER_MAKING'
  }
}
  //////////////////////////////////////////////////////////////////////// CUSTOM MADE STUFF
  export function tokenSymbolLoaded(symbol) {
    return {
      type: 'TOKEN_SYMBOL_LOADED',
      symbol
    }
  }
//////////////////////////////////////////////////// WARNING POPUP
  export function warningLoaded(data) {
    return{
      type: 'WARNING_LOADED',
      data
    }
}
export function warningAkLoaded() {
  return{
    type: 'WARNING_AK_LOADED',
    
  }
}
//////////////////////////////////////////////////// ADMIN PANEL
export function adminOn() {
  return{
    type: 'ADMIN_ON',
  }
}
export function adminOff() {
return{
  type: 'ADMIN_OFF',
  
}
}

/////////////////////////////////////////////////// ALL TOKENS
  export function allTokensLoaded(allTokens) {
    return {
      type: 'ALL_TOKENS_LOADED',
      allTokens
    }
  }

  export function cancelledTokensLoaded(cancelledTokens) {
    return {
      type: 'CANCELLED_TOKENS_LOADED',
      cancelledTokens
    }
  }
  
/////////////////////////////////////////////////// CONTENT
export function contentOn(content) {
  return {
    type: 'CONTENT_LOADED',
    content
  }
}
export function contentData(data) {
  return {
    type: 'CONTENT_DATA_LOADED',
    data
  }
}


export const setTokens = (staff) => ({
  type: 'SET_TOKENS',
  staff
})
/////////////////////////////////CHECKING USER
export const userLoaded = (admin) => ({
  type: 'LOAD_USER',
  admin
})
/////////////////////////////////TOKEN REGISTRATION
export const registerTokenAddress = (address) => ({
type: 'REGISTER_TOKEN_ADDRESS',
address
})

export const queryRegisterTokenAddress = (data) => ({
  type: 'QUERY_REGISTER_TOKEN_ADDRESS',
  data
  })

  export const showRegisterTokenInfo = () => ({
    type: 'SHOW_REGISTER_TOKEN_INFO',
   
    })