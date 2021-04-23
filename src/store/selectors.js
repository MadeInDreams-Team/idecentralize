import { get, groupBy, reject, maxBy, minBy } from 'lodash'
import { createSelector } from 'reselect'
import moment from 'moment'
import { ETHER_ADDRESS, GREEN, RED, tokens, ether } from '../helpers'


export const formatBalance = (balance) => {
  // const precision = 10000
  // balance = ether(balance)
  // balance = Math.round(balance * precision) / precision
  return balance
}



const web3 = state => get(state, 'web3.connection')
export const web3Selector = createSelector(web3, w => w)

const account = state => get(state, 'web3.account')
export const accountSelector = createSelector(account, a => a)

const tokenLoaded = state => get(state, 'token.loaded', false)
export const tokenLoadedSelector = createSelector(tokenLoaded, tl => tl)

const token = state => get(state, 'token.contract')
export const tokenSelector = createSelector(token, t => t)

const stackingLoaded = state => get(state, 'stacking.loaded', false)
export const stackingLoadedSelector = createSelector(stackingLoaded, sl => sl)
const stacks = state => get(state, 'stacking.data', [])
export const stacksSelector = createSelector(stacks, sdl => sdl)
const stackAmount = state => get(state, 'stacking.amount', false)
export const stackAmountSelector = createSelector(stackAmount, sa => sa)


const stacking = state => get(state, 'stacking.contract')
export const stackingSelector = createSelector(stacking, sl => sl)

const exchangeLoaded = state => get(state, 'exchange.loaded', false)
export const exchangeLoadedSelector = createSelector(exchangeLoaded, el => el)

const exchange = state => get(state, 'exchange.contract')
export const exchangeSelector = createSelector(exchange, e => e)

const RTokenLoaded = state => get(state, 'adminPanel.info', false)
export const rTokenLoadedSelector = createSelector(RTokenLoaded, tf => tf)

const loadRTokenInfo = state => get(state, 'adminPanel.data', [])
export const rTokenSelector = createSelector(loadRTokenInfo, tf => tf)


const loadUser = state => get(state, 'exchange.user', [])
export const userSelector = createSelector(loadUser, a => a)


export const contractsLoadedSelector = createSelector(
  tokenLoaded,
  exchangeLoaded,

  (tl, el) => (tl && el)
)


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// TOKENS


const allTokensLoaded = state => get(state, 'exchange.allTokens.loaded', false)
export const allTokensLoadedSelector = createSelector(allTokensLoaded, loaded => loaded)

const allTokens = state => get(state, 'exchange.allTokens.data', [])
export const allTokensSelector = createSelector(allTokens, tokens => tokens)

//TDOD FILTER THE CANCELLED TOKEN AND RETURN OPEN TOKEN

const cancelledTokensLoaded = state => get(state, 'exchange.cancelledTokens.loaded', false)
export const cancelledTokensLoadedSelector = createSelector(cancelledTokensLoaded, loaded => loaded)

const cancelledTokens = state => get(state, 'exchange.cancelledTokens.data', [])
export const cancelledTokensSelector = createSelector(cancelledTokens, o => o)

///////////////////////////////////////////////////////////////////////////////////// CONTENT


const contentLoaded = state => get(state, 'content.loaded', false)
export const contentLoadedSelector = createSelector(contentLoaded, c => c)

const contentDataLoaded = state => get(state, 'content.data', [])
export const contentDataLoadedSelector = createSelector(contentDataLoaded, c => c)

/////////////////////////////////////////////////////////////////////////testing ORDERS


const totalOrdersLoaded = state => get(state, 'exchange.totalOrders.data', [])
export const totalOrdersLoadedSelector = createSelector(totalOrdersLoaded, loaded => loaded)

const totalOrdersCancelled = state => get(state, 'exchange.totalOrdersCancelled.data', [])
export const totalOrdersCancelledSelector = createSelector(totalOrdersCancelled, loaded => loaded)

const totalOrdersFilled = state => get(state, 'exchange.totalOrdersFilled.data', [])
export const totalOrdersFilledSelector = createSelector(totalOrdersFilled, loaded => loaded)

const totalOpenOrders = state => {
  const all = totalOrdersLoaded(state)    // < --------------- CHECK 
  const filled = totalOrdersFilled(state)
  const cancelled = totalOrdersCancelled(state)

  const totalOpenOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id === order.id)
    const orderCancelled = cancelled.some((o) => o.id === order.id)
    return(orderFilled || orderCancelled)
  })

  return totalOpenOrders
}


export const myTotalOpenOrdersSelector = createSelector(
  account,
  totalOpenOrders,
  (account, orders) => {
      // filter orders created by current account
      orders = orders.filter((o) => o.user === account)
      //orders = decorateOrder(orders)
      orders = decorateFilledOrders(orders)
      return orders

  }
)

//////////////////////////////////////////////////////////////////////////////////// LOADING ALL ORDER

// All Orders
const allOrdersLoaded = state => get(state, 'exchange.allOrders.loaded', false)
const allOrders = state => get(state, 'exchange.allOrders.data', [])

// Cancelled orders
const cancelledOrdersLoaded = state => get(state, 'exchange.cancelledOrders.loaded', false)
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, loaded => loaded)

const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
export const cancelledOrdersSelector = createSelector(cancelledOrders, o => o)

// Filled Orders
const filledOrdersLoaded = state => get(state, 'exchange.filledOrders.loaded', false)
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

// Order Filling
const orderFilling = state => get(state, 'exchange.orderFilling', false)
export const orderFillingSelector = createSelector(orderFilling, status => status)




const filledOrders = state => get(state, 'exchange.filledOrders.data', [])
export const filledOrdersSelector = createSelector(
  filledOrders,
  (orders) => {
    
    // Sort orders by date ascending for price comparison
    orders = orders.sort((a,b) => a.timestamp - b.timestamp)
    // Decorate the orders
    orders = decorateFilledOrders(orders)
    // Sort orders by date descending for display
    orders = orders.sort((a,b) => b.timestamp - a.timestamp)
    return orders
  }
)

const decorateFilledOrders = (orders) => {
  // Track previous order to compare history
  let previousOrder = orders[0]
  return(
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateFilledOrder(order, previousOrder)
      previousOrder = order // Update the previous order once it's decorated
      return order
    })
  )
}

const decorateOrder = (order) => {
  let etherAmount
  let tokenAmount

  if(order.tokenGive === ETHER_ADDRESS) {
    etherAmount = order.amountGive
    tokenAmount = order.amountGet
  } else {
    etherAmount = order.amountGet
    tokenAmount = order.amountGive
  }

  // Calculate token price to 5 decimal places
  const precision = 100000
  let tokenPrice = (etherAmount / tokenAmount)
  tokenPrice = Math.round(tokenPrice * precision) / precision

  return({
    ...order,
    etherAmount: ether(etherAmount),
    tokenAmount: tokens(tokenAmount),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ss a M/D')
  })
}

const decorateFilledOrder = (order, previousOrder) => {
  return({
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
  })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  // Show green price if only one order exists
  if(previousOrder.id === orderId) {
    return GREEN
  }

  // Show green price if order price higher than previous order
  // Show red price if order price lower than previous order
  if(previousOrder.tokenPrice <= tokenPrice) {
    return GREEN // success
  } else {
    return RED // danger
  }
}

const openOrders = state => {
  const all = allOrders(state)    // < --------------- CHECK 
  const filled = filledOrders(state)
  const cancelled = cancelledOrders(state)

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id === order.id)
    const orderCancelled = cancelled.some((o) => o.id === order.id)
    return(orderFilled || orderCancelled)
  })

  return openOrders
}


const orderBookLoaded = state => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state)
export const orderBookLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)
//console.log(cancelledOrdersLoaded(state))




// Create the order book
export const orderBookSelector = createSelector(
  openOrders,
  (orders) => {
    // Decorate orders
    orders = decorateOrderBookOrders(orders)
    // Group orders by "orderType"
    orders = groupBy(orders, 'orderType')
    // Fetch buy orders
    const buyOrders = get(orders, 'buy', [])
    // Sort buy orders by token price
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    // Fetch sell orders
    const sellOrders = get(orders, 'sell', [])
    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    return orders
  }
)

const decorateOrderBookOrders = (orders) => {
  return(
    orders.map((order) => {
      order = decorateOrder(order)
      order = decorateOrderBookOrder(order)
      return(order)
    })
  )
}

const decorateOrderBookOrder = (order) => {
  const orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: orderType === 'buy' ? 'sell' : 'buy'
  })
}
/////////////////////////////////////////////////////////////////////////////////////////////////
// MY TRANSACTION 
//
export const myFilledOrdersLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const myFilledOrdersSelector = createSelector(
    account,
    filledOrders,
    (account, orders) => {
        // find our orders
        orders = orders.filter((o) => o.user === account || o.userFill === account)
        // sort by date ascending
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)
        // decorate orders - add display attribute
        orders = decorateMyFilledOrders(orders, account)
        return orders

    }
)
const decorateMyFilledOrders = (orders, account) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order)
            order = decorateMyFilledOrder(order, account)
            return(order)
        })
    )
}

const decorateMyFilledOrder = (order,account) => {
    const myOrder = order.user === account

    let orderType
    if(myOrder) {
        orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    }else {
        orderType = order.tokenGive === ETHER_ADDRESS ? 'sell' : 'buy'
    }

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderSign: (orderType === 'buy' ? '+' : '-')
    })
}

export const myOpenOrdersLoadedSelector = createSelector(orderBookLoaded, loaded => loaded)
export const myOpenOrdersSelector = createSelector(
    account,
    openOrders,
    (account, orders) => {
        // filter orders created by current account
        orders = orders.filter((o) => o.user === account)
        // decorate orders and display attribut
        orders = decorateMyOpenOrders(orders)
        //sort orders by date desc
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)
        return orders

    }
)

const decorateMyOpenOrders = (orders, account) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order)
            order = decorateMyOpenOrder(order, account)
            return(order)
        })
    )
}
const decorateMyOpenOrder = (order, account) => {
    let orderType = order.tokenGive === ETHER_ADDRESS ? 'buy' : 'sell'
    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        
    })
}
/////////////////////////////////////////////////////////////////////////////////////////
// PRICE CHART
//
export const priceChartLoadedSelector = createSelector(filledOrdersLoaded, loaded => loaded)

export const priceChartSelector = createSelector(
  filledOrders,
  (orders) => {
    // Sort orders by date ascending to compare history
    orders = orders.sort((a,b) => a.timestamp - b.timestamp)
    // Decorate orders - add display attributes
    orders = orders.map((o) => decorateOrder(o))
    // Get last 2 order for final price & price change
    let secondLastOrder, lastOrder
    [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
    // get last order price
    const lastPrice = get(lastOrder, 'tokenPrice', 0)
    // get second last order price
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

    return({
      lastPrice,
      lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
      series: [{
        data: buildGraphData(orders)
      }]
    })
  }
)

const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())
  // Get each hour where data exists
  const hours = Object.keys(orders)
  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all the orders from current hour
    const group = orders[hour]
    // Calculate price values - open, high, low, close
    const open = group[0] // first order
    const high = maxBy(group, 'tokenPrice') // high price
    const low = minBy(group, 'tokenPrice') // low price
    const close = group[group.length - 1] // last order

    return({
      x:  new Date(hour),
      y:  [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
    })
  })
console.log('GRAPH DATA : ',graphData)
  return graphData
}

// Cancelling order
const orderCancelling = state => get(state, 'exchange.orderCanelling', false)
export const orderCancellingSelector = createSelector(orderCancelling, status => status)


///////////////////////////////////////////////////////////////////////////////////////////////////////BALANCES
const balancesLoading = state => get(state, 'exchange.balancesLoading', true)
export const balancesLoadingSelector = createSelector(balancesLoading, status => status)





const etherBalance = state => get(state, 'web3.balance', 0)
export const etherBalanceSelector = createSelector(
  etherBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const tokenBalance = state => get(state, 'token.balance', 0)
export const tokenBalanceSelector = createSelector(
  tokenBalance,
  (balance) => {
    return formatBalance(balance)
  }
)
const exchangeEtherBalance = state => get(state, 'exchange.etherBalance', 0)
export const exchangeEtherBalanceSelector = createSelector(
  exchangeEtherBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

const exchangeTokenBalance = state => get(state, 'exchange.tokenBalance', 0)
export const exchangeTokenBalanceSelector = createSelector(
  exchangeTokenBalance,
  (balance) => {
    return formatBalance(balance)
  }
)

///////////////////////////////////////////////////////////////////////////////////////// EXCHANGE DEPOSIT

const etherDepositAmount = state => get(state, 'exchange.etherDepositAmount', null)
export const etherDepositAmountSelector = createSelector(etherDepositAmount, amount => amount)

const etherWithdrawAmount = state => get(state, 'exchange.etherWithdrawAmount', null)
export const etherWithdrawAmountSelector = createSelector(etherWithdrawAmount, amount => amount)

const tokenDepositAmount = state => get(state, 'exchange.tokenDepositAmount', null)
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, amount => amount)

const tokenWithdrawAmount = state => get(state, 'exchange.tokenWithdrawAmount', null)
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, amount => amount)

const buyOrder = state => get(state, 'exchange.buyOrder', {})
export const buyOrderSelector = createSelector(buyOrder, amount => amount)

const sellOrder = state => get(state, 'exchange.sellOrder', {})
export const sellOrderSelector = createSelector(sellOrder, amount => amount)





//////////////////////////////////////////////////////TESTING FOR TOKEN SYMBOL
const tokenSymbolLoaded = state => get(state, 'token.symbol')
export const tokenSymbolLoadedSelector = createSelector(tokenSymbolLoaded, tls => tls)





////////////////////////////////////////////////////////////////////////////////////////POPUP


const warning = state => get(state, 'warning.data')
export const warningSelector = createSelector(warning, w => w)


////////////////////////////////////////////////////////////////////////////////////////ADMIN PANEL


const adminPanel = state => get(state, 'adminPanel', false)
export const adminPanelSelector = createSelector(adminPanel, w => w)