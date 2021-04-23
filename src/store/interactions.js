import Web3 from 'web3'
import Token from '../abis/Token.json' 
import Exchange from '../abis/Exchange.json'
import Stacking from '../abis/Stacking.json'

import { ETHER_ADDRESS } from '../helpers'

// Importing Actions
import {
    web3Loaded,
    web3AccountLoaded, 
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded,
    orderCancelling,
    orderCancelled,
    orderFilling,
    orderFilled,
    tokenSymbolLoaded,
    etherBalanceLoaded,
    tokenBalanceLoaded,
    exchangeEtherBalanceLoaded,
    exchangeTokenBalanceLoaded,
    balancesLoaded,
    balancesLoading,
    buyOrderMaking,
    sellOrderMaking,
    orderMade,
    totalOrdersLoaded,
    allTokensLoaded,
    totalOrdersCancelled,
    totalOrdersFilled,
    userLoaded,
    warningLoaded,
    warningAkLoaded,
    adminOff,
    adminOn,
    queryRegisterTokenAddress,
    showRegisterTokenInfo,
    stackingLoaded,
    stacks,
    contentOn,
    contentData
} from './actions'

// LOADING WEB3 ETEREUM
export const loadWeb3 = (dispatch) => {
    // Connecting to network or Ganache
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545') 
    if(!web3){
        const data = { msg: 'Not connected to the network', desc: 'Please Download Metamask to acces this exchange and connect it to the proper network'}
        dispatch(warningLoaded(data))
        return
    }else {
       if(!window.ethereum){
          const data = { msg: 'Not connected to the network', desc: 'Please Download Metamask to acces this exchange and connect it to the proper network'}
          dispatch(warningLoaded(data))
          return
       } else {
          // silence metamask warning
          window.ethereum.autoRefreshOnNetworkChange = false
          dispatch(web3Loaded(web3))
          return web3
       }          
    }
}
 
// LOADING METAMASK ACCOUNT
export const loadAccount = async (web3, dispatch) => {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
	  const accounts = await web3.eth.getAccounts()
	  const account = await accounts[0]
	  if(typeof account !== 'undefined'){
		  dispatch(web3AccountLoaded(account))
		  return account
  	} else {
		  const data = { msg: 'Could not connet to your wallet', desc: 'Please Download Metamask to acces this exchange and connect it to the proper network'}
      dispatch(warningLoaded(data))
      return
	  }
} 

// LOADING TOKENS CONTRACT
export const loadToken = async (web3, exchange, address, dispatch) => {
  console.log('Received Address : ',address)
  let tokenToLoad
  //Need to deal with NetworkId
  await exchange.getPastEvents('OtherToken', {fromBlock:0, toBlock: 'latest'}).then( async(result) => {
    const allTokens = result.map((event) => event.returnValues)
    allTokens.forEach(element => {
      // If no address is defined
      if(address === 0){  
         if(element.tokenId === '1' ) {
            // Load the first registered token
            tokenToLoad = element.tokenAddress
         }
      // An adress was defined
      } else {
        if (element.tokenAddress === address){
          tokenToLoad = element.tokenAddress
        }
      }
    })
 })
  try {
      // need to load optionals from admin panel. see https://web3js.readthedocs.io/en/v1.2.0/web3-eth-contract.html
      const token = new web3.eth.Contract(Token.abi, tokenToLoad) 
      console.log('TOKEN TO LOAD',tokenToLoad)
      dispatch(tokenLoaded(token))
      loadTokenSymbol(token, dispatch).then( async () => {
        dispatch(balancesLoading())
        // TODO add spiners on order loading when not filling
        loadAccount(web3,dispatch).then(async (result) => {
        loadBalances(dispatch, web3, exchange, token, result)
        loadAllOrders(exchange, dispatch, token)
        })   
      })
      return token
    } catch (error) {
        const data = { msg: 'Could not load contract', desc: 'You sould report this issue to the administrator'}
        dispatch(warningLoaded(data))
        return
    } 
  }

  // LOADING EXCHANGE ETHEREUM CONTRACT
  export const loadExchange = async (web3, networkId, dispatch) => {
    try {
      const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
      dispatch(exchangeLoaded(exchange))
      return exchange
    } catch (error) {
        console.log('Exchange contract not deployed to the current network. Please select another network with Metamask.')
      return null
    }
  }

  // LOADING STACKING ETHEREUM CONTRACT
  export const loadStacking = async (web3, networkId, dispatch) => {
    try {
      const stacking = new web3.eth.Contract(Stacking.abi, Stacking.networks[networkId].address)
      dispatch(stackingLoaded(stacking))
      return stacking
    } catch (error) {
        console.log('Exchange contract not deployed to the current network. Please select another network with Metamask.')
      return null
    }
  }




////////////////////////////////////////////////////////////////////////////////////////////////////////////// LOADING ORDERS
  export const loadAllOrders = async (exchange, dispatch, token) => {
    // cacelled orders
    const cancelStream = await exchange.getPastEvents('Cancel', { fromBlock: 0, toBlock: 'latest'})
    //format cancelled orders
    const cancelledOrders = cancelStream.map((event) => event.returnValues)
    // add cancel order to the redux store  ///////////////////////////////////////////////////////// REFORMAT HERE
    let cancelledOrderCount = 0
    let cancelledOrdersOnToken = []
    cancelledOrders.forEach(element => {
     if( (element.tokenGive === token.options.address) || (element.tokenGet === token.options.address)) {
      cancelledOrdersOnToken[cancelledOrderCount] = element
      cancelledOrderCount =+1
     }
    });
    dispatch( totalOrdersCancelled(cancelledOrders) )
    dispatch(cancelledOrdersLoaded(cancelledOrdersOnToken))
    // filled orders
    const tradeStream = await exchange.getPastEvents('Trade', { fromBlock: 0, toBlock: 'latest'})
    const filledOrders = tradeStream.map((event) => event.returnValues)
    //////////////////////////////////////////////////////////////////////////////////////////////// REFORMAT HERE
    let filledOrderCount = 0
    let filledOrdersOnToken = []
    filledOrders.forEach(element => {
     if( (element.tokenGive === token.options.address) || (element.tokenGet === token.options.address)) {
      filledOrdersOnToken[filledOrderCount] = element
      filledOrderCount =+1
     }
    });
    dispatch(totalOrdersFilled(filledOrders))
    dispatch(filledOrdersLoaded(filledOrdersOnToken))
    //all orders
    const orderStream = await exchange.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest'})

    const allOrders = orderStream.map((event) => event.returnValues)
    let allOrderCount = 0
    let allOrdersOnToken = []
  // console.log('ALL OREDERS BEFORE : ',allOrders)

    allOrders.forEach(element => {
     if( (element.tokenGive === token.options.address) || (element.tokenGet === token.options.address)) {
      allOrdersOnToken[allOrderCount] = element
     // console.log('ELEMENT : ',element)
      //console.log('ORDER tokenGive : ',element.tokenGive)
      allOrderCount +=1

     }

    });
    //console.log('ALL OREDERS AFTER : ',allOrdersOnToken)
    dispatch(totalOrdersLoaded(allOrders))
    dispatch(allOrdersLoaded(allOrdersOnToken))
    //console.log(allOrders)
  }
// LOADING TOKENS

export const loadAllTokens = async (exchange, dispatch) => {
  const result = await exchange.getPastEvents('OtherToken', {fromBlock:0, toBlock: 'latest'});
  const allTokens = result.map((event) => event.returnValues);
 //console.log('RESULT : ',allTokens )
  await Promise.all(allTokens.map(async (element) => {
    const innerResult = await exchange.methods.getERCsymbol(element.tokenAddress).call();
    element.symbol = innerResult;
    element[2]= innerResult;
  }));

  dispatch(allTokensLoaded(allTokens));
}
 
// EVENTS
export const subscribeToEvents = async (exchange, dispatch) => {
  exchange.events.Cancel({}, (error,event) => {
    dispatch(orderCancelled(event.returnValues))
  })
  exchange.events.Trade({}, (error,event) => {
    dispatch(orderFilled(event.returnValues))
  })
  exchange.events.Deposit({}, (error,event) => {
    dispatch(balancesLoaded())
    
  })
  exchange.events.Withdraw({}, (error,event) => {
    dispatch(balancesLoaded())
  })
  exchange.events.Order({}, (error,event) => {
    dispatch(orderMade(event.returnValues))
  })
}

///////////////////////////////////////////////////////////////////// CANCEL ORDER
export const cancelOrder = (dispatch, exchange, order, account) => {
  exchange.methods.cancelOrder(order.id).send({ from: account })
  .on('transcationHash', (hash) => {
    dispatch(orderCancelling())

  })
  .on('error', (error) => {
    console.log(error)
    window.alert('there was an error cancelling')
  })
}
////////////////////////////////////////////////////////////////////// FILL ORDER
export const fillOrder = async (dispatch, exchange, order, account, exchangeTokenBalance, exchangeEtherBalance, symbol, web3, token) => {
  dispatch(balancesLoading())

 // let decimals = await token.methods.decimals().call
  let amount = order.amountGet /(10**18)
  let amountGive = order.amountGive /(10**18)
  console.log('AMOUNT GET BY SELLER:',amount)
  console.log('AMOUNT PAYED BY BUYER:',amountGive)
  //let feeAmount = (amount * feePercent) / 100
  let balance

  // check the balance
  if(order.tokenGet === ETHER_ADDRESS){
    balance = await exchangeEtherBalance
   
  } else {
    balance = await exchangeTokenBalance
  }
   console.log('SELLER GET : ',order.tokenGet)
   console.log('BUYER PAYES : ',order.tokenGive)
   console.log('BALANCE : ', balance)
  // console.log('AMOUNT : ',amount)
  // console.log('FEE AMOUNT : ',feeAmount)
  console.log('EVAL : ',amount > balance && order.tokenGet === ETHER_ADDRESS)

 if (amount > balance && order.tokenGet === ETHER_ADDRESS) {
  const data = {
    msg: 'Insuficient Balance', 
    desc: 'Not enough Ether in your account to fill the order. Please deposit some Ether. Your curently have '+balance+' Ether on the exchange.'}
    dispatch(warningLoaded(data))
dispatch(balancesLoaded())
} else if (amount > balance && order.tokenGet !== ETHER_ADDRESS) {
   const data = {
    msg: 'Insuficient Balance', 
    desc: 'Not enough '+ symbol +' in your account to fill the order. Please deposit some '+ symbol +'. Your curently have '+balance+' '+symbol+' on the exchange.'}
    dispatch(warningLoaded(data))
dispatch(balancesLoaded())
} else {
  exchange.methods.fillOrder(order.id).send({ from: account })
  .on('transcationHash', (hash) => {
    dispatch(orderFilling())

  })
  .on('error', (error) => {
    console.log(error)
    window.alert('There was an error filling your order')
    dispatch(balancesLoaded())
  }).then( async () =>{
    loadBalances(dispatch, web3, exchange, token, account) 
 })
}
}
///////////////////////////////////////////////////////////////// LOADING BALANCES
export const loadBalances = async (dispatch, web3, exchange, token, account) => {

  // ETHER BALANCE IN WALLET
  const etherBalance = await web3.eth.getBalance(account)
  const ebalance = web3.utils.fromWei(etherBalance, 'ether')

  dispatch(etherBalanceLoaded(ebalance))
  // TOKEN BALANCE IN WALLET
  const tokenBalance = await token.methods.balanceOf(account).call()
  const tbalance = web3.utils.fromWei(tokenBalance, 'ether')
  dispatch(tokenBalanceLoaded(tbalance))
    // ETHER BALANCE IN Exchange
    const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
    const xebalance = web3.utils.fromWei(exchangeEtherBalance, 'ether')
    dispatch(exchangeEtherBalanceLoaded(xebalance))
      // TOKEN BALANCE IN WALLET
  const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
  const xtbalance = web3.utils.fromWei(exchangeTokenBalance, 'ether')
  dispatch(exchangeTokenBalanceLoaded(xtbalance))

  /// ALL BALANCE LOADED
  dispatch(balancesLoaded())

}

///////////////////////////////////////////////////////////////////////// DEPOSITING & WITHDRAWING

///////////////////////////////////////////////////////////////////////////////////////////////////DEPOSIT ETHER
export const depositEther = async (dispatch, exchange, web3, amount, account, token) => {
  dispatch(balancesLoading())
  web3.eth.getBalance(account,function(error,result){

    if(error){
       console.log(error)
    }
    else{
       let balance = web3.utils.fromWei(result, 'ether')
       if(amount > balance){
        const data = {       
                    msg: 'Insuficient Balance', 
                    desc: 'You dont have this amount of Ether in your wallet. You have '+balance+' Ether'}
                    dispatch(warningLoaded(data))
                    dispatch(balancesLoaded())
        } else {
        exchange.methods.depositEther().send({ from: account, value: web3.utils.toWei(amount, 'ether')})
         .on('transactionHash',(hash) => {  
         })
         .on('error', (error) => {
           //console.log(error)
           const data = {     
            msg: error, 
            desc: error}
            dispatch(warningLoaded(data))
            dispatch(balancesLoaded())
         }).then( async () =>{
          loadBalances(dispatch, web3, exchange, token, account) 
       })
       }
    }
 })

 
 
 }
 
////////////////////////////////////////////////////////////////////////////////////////////////////////////WITHDRAW ETHER
export const withdrawEther = async (dispatch, exchange, web3, amount, account, token, orders, totalOrders, myTotalOpenOrders) => {
  dispatch(balancesLoading())
  let decimals = await token.methods.decimals().call()
  let balance = await exchange.methods.balanceOf(ETHER_ADDRESS,account).call()
  balance = web3.utils.fromWei(balance, 'ether')
console.log('TOTAL OPEN ORDERS : ',myTotalOpenOrders)
 // Check if there is open orders for the token
 let totalEtherInOrder = 0
 let totalToWithdraw
 var asOpenOrders 
 
 myTotalOpenOrders.forEach(order => {
   // he ass sell orders for token
   if(order.tokenGive === ETHER_ADDRESS ){
     asOpenOrders = true
     // add order amount to total
     console.log(order)
     totalEtherInOrder += order.etherAmount
     console.log('TOTAL ETHER IN ORDERS',totalEtherInOrder)
     console.log('DECIMALS : ',decimals)


   }
 });
 totalToWithdraw = balance - totalEtherInOrder
    console.log('BALANCE : ', balance)
    console.log('AMOUNT : ', amount)
    if(amount > totalToWithdraw ){
      console.log('TOTAL TO WITHDRAW :',totalToWithdraw)
      if(asOpenOrders === true){ 
        console.log(asOpenOrders)
        const data= {
                    
                     msg: 'You have open orders', 
                     desc: 'You have '+totalEtherInOrder+' Ether in open order(s). Please lower the amount you wish to withdraw or cancel your order(s). You curently have '+totalToWithdraw +' Ether Available to withdraw.'}
                     dispatch(warningLoaded(data))
      } else {
        
        const data = {
                     msg: 'Insuficient Balance', 
                     desc: 'You dont have this amount of Ether in your account. You have '+balance+' Ether'}
                     dispatch(warningLoaded(data))
      }
      dispatch(balancesLoaded())
    
    } else {

    exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({ from: account })
    .on('transactionHash',(hash) =>  {
      
      
    })
    .on('error', (error) => {
      dispatch(balancesLoaded())
      console.log(error) // log any remaining error in console
    }).then( async () =>{
      loadBalances(dispatch, web3, exchange, token, account) 
   })
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////DEPOSIT TOKEN
export const depositToken = async (dispatch, exchange, web3, token, amount, account) => {
  dispatch(balancesLoading())

  console.log('DEPOSITING : ', token.options.address)
  //let decimals = await token.methods.decimals().call()
  let symbol = await token.methods.symbol().call()
  let balance = await token.methods.balanceOf(account).call()
  balance = web3.utils.fromWei(balance, 'ether')
    console.log('BALANCE : ', balance)
    console.log('AMOUNT : ', amount)
    balance = parseInt(balance) 
    amount = parseInt(amount)

  if(amount > balance){
    
    const data = {msg: 'Insuficient Balance', desc: 'You dont have this amount of '+symbol+' in your wallet. You have '+balance+' '+symbol}
    dispatch(warningLoaded(data))
    dispatch(balancesLoaded())
  } else {
    amount = amount.toString()
    amount = web3.utils.toWei(amount, 'ether')
    token.methods.approve(exchange.options.address, amount).send({ from: account })
    .on('transactionHash',(hash) => {
      exchange.methods.depositToken(token.options.address, amount).send({ from: account })
    .on('transactionHash',(hash) => {
     // dispatch(balancesLoading())
   })
   .on('error', (error) => {
    dispatch(balancesLoaded())
      console.log(error)
   }).then( async () =>{
   loadBalances(dispatch, web3, exchange, token, account) 
   })
  })

  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////WITHDRAW TOKEN
export const withdrawToken = async (dispatch, exchange, web3, token, amount, account, symbol, orders) => {
  dispatch(balancesLoading())
 let balance = await exchange.methods.balanceOf(token.options.address, account).call()
 //let decimals =await token.methods.decimals().call()
 balance = web3.utils.fromWei(balance, 'ether')
 // Check if there is open orders for the token
 let totalTokensInOrder = 0
 let totalToWithdraw
 var asOpenOrders 
 orders.forEach(order => {
   // he ass sell orders for token
   if(order.tokenGive === token.options.address ){
     asOpenOrders = true
     // add order amount to total
     totalTokensInOrder += parseInt(order.tokenAmount)
     console.log('TOTAL TOKEN IN ORDERS',totalTokensInOrder)
     //console.log(typeof(asOpenOrders))
   }
 });
 //console.log(orders)
totalToWithdraw = balance - totalTokensInOrder
console.log('AMOUNT : ',amount)
console.log('TOTAL AVAILABLE : ',totalToWithdraw)
if(amount > totalToWithdraw ){
  if(asOpenOrders === true){ 
    const data = { 
                 msg: 'You have open orders', 
                 desc: 'You have '+totalTokensInOrder+' '+symbol+ ' in open order(s). Please lower the amount you wish to withdraw or cancel your order(s). You curently have '+totalToWithdraw+' '+symbol+' Available to withdraw.'}
                 dispatch(warningLoaded(data))
  } else {
    console.log(asOpenOrders)
    const data = { 
                 msg: 'Insuficient Balancex', 
                 desc: 'You dont have this amount of '+symbol+' in your account. You have '+balance+' '+symbol}
                 dispatch(warningLoaded(data)) 
  }
  dispatch(balancesLoaded())

} else {
    exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
    .on('transactionHash',(hash) => {
    
     })
    .on('error', (error) => {
      dispatch(balancesLoaded())
    console.log(error)
    window.alert('There was an error withdrawing tokens')
  }).then( async () =>{
    loadBalances(dispatch, web3, exchange, token, account) 
 })

}
}
 ///////////////////////////////////////////////////////////////////////////////////////////////////////////MAKE BUY ORDER
export const makeBuyOrder = async (dispatch, exchange, token, web3, order, account) => {
  const tokenGet = token.options.address
  let decimals = await token.methods.decimals().call()
  let balance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call() / (10 ** decimals)
  
  const amountGet = web3.utils.toWei(order.amount, 'ether')
  const tokenGive = ETHER_ADDRESS
  const amountGive = await web3.utils.toWei((order.amount * order.price).toString(), 'ether')
 
  if ((order.amount * order.price) > balance) {
    const data = {msg: 'Insuficient Balance', desc: 'Not enough Ether in your account to execute the order. Please deposit some Ether or use a smaller amount. Your curently have '+balance+' Ether in your account.'}
    dispatch(warningLoaded(data))
  } else {

exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from:account })
  .on('transactionHash',(hash) => {
    dispatch(buyOrderMaking())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert('There was an error making your buy order')
  })

}
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////MAKE SELL ORDER
export const makeSellOrder = async (dispatch, exchange, token, web3, order, account) => {
  let decimals = await token.methods.decimals().call() 
  let balance = await exchange.methods.balanceOf(token.options.address, account).call() / (10 ** decimals)
  const symbol = await token.methods.symbol().call()
  const tokenGet = ETHER_ADDRESS
  const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')
  const tokenGive = token.options.address
  const amountGive = web3.utils.toWei(order.amount, 'ether')
   if (order.amount > balance) {
    const data = {
                 
                  msg: 'Insuficient Balance', 
                  desc: 'Not enough '+symbol+' in your account to execute the order. Please deposit some '+symbol+' or use a smaller amount. Your curently have '+balance+' '+symbol+' in your account.'}
                  dispatch(warningLoaded(data))
   } else {
exchange.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from:account })
  .on('transactionHash',(hash) => {
    dispatch(sellOrderMaking())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert('There was an error making your sell order')
  })
}

}




/////////////////////////////////////////////////////////////// CUSTOM  BY MADEINDREAMS

//// LOADING STACKS

export const loadStackData = async (stacking, dispatch, account) => {
  const len = await stacking.methods.poolLength().call()
  console.log(len) 
  let data = []
  let i = 0
  for(i=0;i<len;i++){
     data[i] = await stacking.methods.poolInfo(i).call() 
     data[i]['supply']= await stacking.methods.getERCBalance(data[i].tokenStack,stacking.options.address).call()
     data[i]['name']= await stacking.methods.getERCname(data[i].tokenStack).call()
     data[i]['symbol']= await stacking.methods.getERCsymbol(data[i].tokenStack).call()
     data[i]['stacked'] = await stacking.methods.stackingBalanceOf(i, account).call()
     data[i]['pending'] = await stacking.methods.pendingIDT(i).call({from:account})
  }
  dispatch(stacks(data))
    return data
}

///// STACKING

export const stackToken = async (stacking, token, account, amount, id, web3, dispatch) => {
  console.log('START')
  const tokenx = new web3.eth.Contract(Token.abi, token) 
  amount = web3.utils.toWei(amount, 'ether')
  await tokenx.methods.approve(stacking.options.address, amount).send({ from: account })
 .on('transactionHash', async (hash) => {
   console.log('IS APPROVED')
 }).then( async () => {
  await stacking.methods.deposit(amount,id).send({from : account})
  .on('transactionHash', async (hash) => {
    console.log('DEPOSITED')
  }).then(async () =>{
    await loadStackData(stacking, dispatch, account)
  })

 })
   
}

export const unStackToken = async (stacking, account, amount, id, web3, dispatch) => {
amount = web3.utils.toWei(amount, 'ether')
await stacking.methods.withdraw(amount,id).send({from : account})
.on('transactionHash', async (hash) => {
  console.log('WITHDRAWED')
}).then(async () =>{
  await loadStackData(stacking, dispatch, account)
})
}

/////////////////////////////////////////////////////////////// LOADING TOKEN SYMBOL
export const loadTokenSymbol = async (token, dispatch) => {
  const symbol = await token.methods.symbol().call()          
    //console.log(symbol)
    dispatch(tokenSymbolLoaded(symbol))
    return symbol
}

//////////////////////////////////////////////////////////////////POPUP


export const loadWarning = async (data, dispatch) => {
  try {
    } catch (error) {
        alert('COULD NOT LOAD WARNING')
        return
    } 
  }

  export const UnloadWarning = async (dispatch) => {
          dispatch(warningAkLoaded())
          return true
      }

/////////////////////////////////////////////////////////// ADMIN PANEL
      export const CloseAdminPanel = async (dispatch) => {
        dispatch(adminOff())
        return true
    }

    export const OpenAdminPanel = async (dispatch) => {
      dispatch(adminOn())
      return true
  }
/////////////////////////////////////////////////////////// CONTENT 
  export const OpenContent = async (dispatch, content) => {
    dispatch(contentOn())
    dispatch(contentData(content))
    return true
}

///////////////////////////////////////////////////////// Administration and user references

export const loadUser = async (exchange, account, dispatch) => {
  //Checking if user is contract owner
const admin = await exchange.methods.isAdmin().call({from:account})
 // Dispatch the user true or false
dispatch(userLoaded(admin))
return admin
}


export const registerToken = async (exchange, account, address, dispatch) =>{

  await exchange.methods.registerToken(address).send({from:account})
}
/////////////////////////////////////////////////////////////////////////////////////QUERY TOKEN INFO PRIOR TO REGISTRATION
export const queryRegisterToken = async (exchange, account, address, dispatch) =>{

if(address.length < 42 || address.length > 42 ){

  console.log('NOT A VALID ADDRESS')
}else {

  const rTokenSymbol = await exchange.methods.getERCsymbol(address).call()
  const rTokenName = await exchange.methods.getERCname(address).call()
  const rTokentotalSupply = await exchange.methods.getERCtotalSupply(address).call()
  const rTokenDecimals = await exchange.methods.getERCdecimals(address).call()
  
  const data = {
    name: rTokenName,
    symbol: rTokenSymbol,
    totalSupply: rTokentotalSupply ,
    decimals: rTokenDecimals,
    address: address
  }
  
  
  console.log('TOKEN TO REGISTER : ', data)
  
  dispatch(queryRegisterTokenAddress(data))
  dispatch(showRegisterTokenInfo())
  return data
}



  
}









///////////////////////////////////////////////////////////////// ADD A TOKEN TO METAMASK


export const addToMetamask = async (token) => {
  console.log(token)
  const tokenAddress = token.options.address
  const tokenSymbol = await token.methods.symbol().call() 
  const tokenDecimals = await token.methods.decimals().call() 
  const tokenImage = 'https://madeindreams.ca/logo.svg';
  
  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: tokenAddress, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
    });
  
    if (wasAdded) {
      console.log('Thanks for your interest!');
    } else {
      console.log('Your loss!');
    }
  } catch (error) {
    console.log(error);
  }

}