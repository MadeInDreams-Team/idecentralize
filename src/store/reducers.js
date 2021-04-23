import { combineReducers } from 'redux';



function warning(state = {}, action) {
  switch(action.type){
      case 'WARNING_LOADED':
      return  { ...state, loaded: true ,  data: action.data }
      case 'WARNING_AK_LOADED':
      return  { ...state, loaded: false , data: null }
      default:
          return state
  }
}

function adminPanel(state = {}, action) {
  switch(action.type){
      case 'ADMIN_ON':
      return  { ...state, loaded: true  }
      case 'ADMIN_OFF':
      return  { ...state, loaded: false }
      case 'QUERY_REGISTER_TOKEN_ADDRESS':
      return  { ...state, loaded: true, data: action.data }
      case 'SHOW_REGISTER_TOKEN_INFO':
        return  { ...state, info: true }

      
      default:
          return state
  }
}

function content(state = {}, action) {
  switch(action.type){
    case 'CONTENT_LOADED':
      return  { ...state, loaded: true  }
      case 'CONTENT_DATA_LOADED':
      return  { ...state, loaded: true, data: action.data  }
      default:
        return state
  }
}



// reducers
function web3(state = {}, action) {
    switch(action.type){
        case 'WEB3_LOADED':
        return { ...state, connection: action.connection}
        case 'WEB3_ACCOUNT_LOADED':
        return { ...state, account: action.account}
        case 'ETHER_BALANCE_LOADED':
          return { ...state, balance : action.balance}
        default:
            return state
    }

}

////////////////////////////////////////////
function token(state = {}, action) {
    switch (action.type) {
      case 'TOKEN_LOADED':
        return { ...state, loaded: true, contract: action.contract }
         case 'TOKEN_BALANCE_LOADED':
          return { ...state, balance : action.balance}
        case 'TOKEN_SYMBOL_LOADED':
        return { ...state, loaded: true, symbol: action.symbol}
      default:
        return state
    }
  }

  function stacking(state = {}, action) {
    switch (action.type) {
        case 'STACKING_LOADED':
            return { ...state, loaded: true, contract: action.contract }
            case 'STACKS':
            return { ...state, loaded: true, data: action.data }
            case 'STACKS_AMOUNT_CHANGED':
            return { ...state, loaded: true, amount: action.amount }
            default:
              return state
    }
  }


////////////////////////////////////////////////////////////
  function exchange(state = {}, action) {
    let index, data
    switch (action.type) {
        case 'EXCHANGE_LOADED':
            return { ...state, loaded: true, contract: action.contract }
        case 'CANCELLED_ORDERS_LOADED':
            return { ...state, cancelledOrders: { loaded: true, data: action.cancelledOrders }}
            case 'FILLED_ORDERS_LOADED':
                return { ...state, filledOrders: { loaded: true, data: action.filledOrders }}
                case 'ALL_ORDERS_LOADED':
                    return { ...state, allOrders: { loaded: true, data: action.allOrders }} ////////// For actual TOKEN
                    case 'LOAD_USER':
                      return { ...state, user: { loaded: true, admin: action.admin }}

                    case 'TOTAL_ORDERS_LOADED':
                    return { ...state, totalOrders: { loaded: true, data: action.totalOrders }}
                    case 'TOTAL_ORDERS_FILLED':
                    return { ...state, totalOrdersFilled: { loaded: true, data: action.totalOrdersFilled }}
                    case 'TOTAL_ORDERS_CANCELLED':
                    return { ...state, totalOrdersCancelled: { loaded: true, data: action.totalOrdersCancelled }}

                    /////////////////////////////////////////////////////////////////////////////////////////// ALL TOKENS
                    case 'MARKET_LOADING':
                      return { ...state,  market: {loaded: false}}

                      case 'ALL_TOKENS_LOADED':
                      return { ...state, allTokens: { loaded: true, data: action.allTokens }}
                      case 'CANCELLED_TOKENS_LOADED':
                      return { ...state, cancelledTokens: { loaded: true, data: action.cancelledTokens }}

                    case 'ORDER_CANCELLING':
                      return { ...state, orderCancelling: true }
                      case 'ORDER_CANCELLED':
                      return { 
                        ...state,
                        orderCacelling: false,
                        cancelledOrders: {
                          ...state.cancelledOrders,
                          data: [
                            ...state.cancelledOrders.data,
                            action.order
                          ]
                        }

                       }
                       case 'ORDER_FILLED':
                         // prevent duplicate
                         index = state.filledOrders.data.findIndex(order => order.id === action.order.id)
                         if(index === -1){
                           data = [...state.filledOrders.data, action.order]
                         }else {
                           data = state.filledOrders.data
                         }
                         return {
                           ...state,
                           orderFilling: false,
                           filledOrders: {
                             ...state.filledOrders,
                             data
                           }
                         }
                      case 'ORDER_FILLING':
                        return { ...state, orderFilling: true }

                      ///////////////BALANCES
                      case 'EXCHANGE_ETHER_BALANCE_LOADED':
                        return { ...state, etherBalance : action.balance}
                      case 'EXCHANGE_TOKEN_BALANCE_LOADED':
                        return { ...state, tokenBalance: action.balance}
                      case 'BALANCES_LOADING':
                        return { ...state,balancesLoading: true}
                      case 'BALANCES_LOADED':
                        return { ...state,balancesLoading: false}
                      case 'ETHER_DEPOSIT_AMOUNT_CHANGED':
                        return { ...state,etherDepositAmount: action.amount}
                      case 'ETHER_WITHDRAW_AMOUNT_CHANGED':
                        return { ...state,etherWithdrawAmount: action.amount}
                      case 'TOKEN_DEPOSIT_AMOUNT_CHANGED':
                        return { ...state,tokenDepositAmount: action.amount}
                      case 'TOKEN_WITHDRAW_AMOUNT_CHANGED':
                        return { ...state,tokenWithdrawAmount: action.amount}

                      case 'BUY_ORDER_AMOUNT_CHANGED':
                        return { ...state, buyOrder:{...state.buyOrder, amount: action.amount } }
                      case 'BUY_ORDER_PRICE_CHANGED':
                        return { ...state, buyOrder: {...state.buyOrder, price: action.price } }
                     case 'BUY_ORDER_MAKING':
                        return { ...state, buyOrder: { ...state.buyOrder, amount: null, price: null, making: true } }

                        case 'ORDER_MADE':
                          // prevent duplicate order
                          index = state.allOrders.data.findIndex(order => order.id === action.order.id)

                          if(index === -1) {
                            data = [...state.allOrders.data, action.order]
                          } else {
                            data  = state.allOrders.data
                          }

                          return {
                            ...state,
                            allOrders:{
                              ...state.allOrders,
                              data
                            },
                            buyOrder:{
                              ...state.buyOrder,
                              making: false
                            },
                            sellOrder:{
                              ...state.sellOrder,
                              making: false
                            }
                          }
                          case 'SELL_ORDER_AMOUNT_CHANGED':
                            return { ...state, sellOrder:{...state.sellOrder, amount: action.amount } }
                          case 'SELL_ORDER_PRICE_CHANGED':
                            return { ...state, sellOrder: {...state.sellOrder, price: action.price } }
                          case 'SELL_ORDER_MAKING':
                            return { ...state, sellOrder: {...state.sellOrder, amount: null, price: null, making: true} }
    
                      
                      default:
                        return state
    }
  }


   const initialState = {
     loading: false,
     tokens: [],
     error: null
   };
  
   function tokens(state = initialState, action) {
    switch (action.type) {
      case 'ALL_TOKENS_STARTED':
        return { ...state, loading: true
        };
      case 'ALL_TOKENS_LOADED':
        return { ...state, loading: false, error: null, tokens: [...state.tokens, action.tokens]
        };
      case 'ALL_TOKENS_FAILURE':
        return {...state, loading: false,error: action.error
        };
      default:
        return state;
    }
  }
 




// combining reducers

const rootReducer = combineReducers({
    web3,
    token,
    exchange,
    warning,
    tokens,
    adminPanel,
    content,
    stacking
   
})

//exporting combined reducers

export default rootReducer