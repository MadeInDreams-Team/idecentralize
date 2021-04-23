
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'

import { 
    tokenSymbolLoadedSelector,
    web3Selector, 
    exchangeSelector, 
    tokenSelector, 
    accountSelector,
    etherBalanceSelector,
    tokenBalanceSelector,
    exchangeEtherBalanceSelector,
    exchangeTokenBalanceSelector,
    balancesLoadingSelector, 
    etherDepositAmountSelector,
    etherWithdrawAmountSelector,
    tokenDepositAmountSelector,
    tokenWithdrawAmountSelector,
    myOpenOrdersSelector,
    myTotalOpenOrdersSelector,
    totalOrdersLoadedSelector
    
    
} from '../store/selectors'
import {loadBalances,
        depositEther,
        withdrawEther,
        depositToken,
        withdrawToken
} from '../store/interactions'
import { 
         etherDepositAmountChanged,
         etherWithdrawAmountChanged,
         tokenDepositAmountChanged,
         tokenWithdrawAmountChanged,

} from '../store/actions'

const showBalance = (balance) => {
//balance = Math.round(parseFloat(balance)).toFixed(5)
balance = Math.round((balance) * 1000) / 1000
return balance
}

const showForm =  (props) => {
    const {
        etherBalance,
        tokenBalance,
        exchangeEtherBalance,
        exchangeTokenBalance,
        symbol,
        dispatch,
        etherDepositAmount,
        etherWithdrawAmount,
        tokenDepositAmount,
        tokenWithdrawAmount,
        web3,
        token,
        account,
        exchange, 
        myOpenOrders,
        myTotalOpenOrders,
        totalOrders
    } = props
    return (
    <Tabs defaultActiveKey="deposit" className=" text-white">

        <Tab eventKey="deposit" title="Deposit" className="bg-transparent">
            <table className="table bg-transparent text-white table-sm small">
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>ETH</th>
                        <th>{  showBalance(etherBalance) }</th>
                        <th>{ showBalance(exchangeEtherBalance)   }</th>
                    </tr>
                    </tbody>
               </table>

               <form className ="row" onSubmit={(event) => {
                event.preventDefault()

                depositEther(dispatch, exchange, web3, etherDepositAmount, account, token)
                
                
            }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                     type="number"
                     min="0.000000000000000001"
                     step="0.000000000000000001"
                    placeholder="ETH Amount"
                    onChange={(e) => dispatch(etherDepositAmountChanged(e.target.value))}
                    className="form-control form-control-sm bg-transparent text-white"
                    required
                    />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm btn-custom">Deposit</button>

                </div>
            </form>

               <table className="table bg-transparent text-white table-sm small">
                   <tbody>
                    <tr>
                        <th>{ symbol }</th>
                        <th>{ showBalance(tokenBalance) }</th>
                        <th>{ showBalance(exchangeTokenBalance) }</th>
                    </tr>
                </tbody>
            </table>
            <form className ="row" onSubmit={(event) => {
                event.preventDefault()
                depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)
                
                
            }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                     type="number"
                     min="0.000000000000000001"
                     step="0.000000000000000001"
                    placeholder={`${symbol} Amount`}
                    onChange={(e) => dispatch(tokenDepositAmountChanged(e.target.value))}
                    className="form-control form-control-sm bg-transparent text-white"
                    required
                    />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm btn-custom">Deposit</button>

                </div>
            </form>

        </Tab>

        <Tab eventKey="withdraw" title="Withdraw" className="bg-transparent text-white">
        <table className="table bg-transparent text-white table-sm small">
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                    </tr>
                </thead>
             <tbody>
                    <tr>
                        <th>ETH</th>
                        <th>{ etherBalance }</th>
                        <th>{ exchangeEtherBalance }</th>
                    </tr>
                </tbody>    
                </table>


                    <form className ="row" onSubmit={(event) => {
                event.preventDefault()
                withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account, token, myOpenOrders, totalOrders, myTotalOpenOrders)
                
                
                
            }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                    type="number"
                    min="0.000000000000000001"
                    step="0.000000000000000001"
                    placeholder="ETH Amount"
                    onChange={(e) => dispatch(etherWithdrawAmountChanged(e.target.value))}
                    className="form-control form-control-sm bg-transparent text-white"
                    required
                    />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm btn-custom">Withdraw</button>

                </div>
            </form>


            <table className="table bg-transparent text-white table-sm small">
                <tbody>
                    <tr>
                        <th>{ symbol }</th>
                        <th>{ tokenBalance }</th>
                        <th>{ exchangeTokenBalance }</th>
                    </tr>
                </tbody>
            </table>
            <form className ="row" onSubmit={(event) => {
                event.preventDefault()
                withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account, symbol, myOpenOrders)
                
                
            }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                    type="number"
                    min="0.000000000000000001"
                    step="0.000000000000000001"
                    placeholder={`${symbol} Amount`}
                    onChange={(e) => dispatch(tokenWithdrawAmountChanged(e.target.value))}
                    className="form-control form-control-sm bg-transparent text-white"
                    required
                    />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm btn-custom">Withdraw</button>

                </div>
            </form>


        </Tab>

    </Tabs>
    )
}

class Balance extends Component {
    componentDidMount() {
        this.loadBlockchainData()
    }

    async loadBlockchainData(){
        
      const { dispatch, web3, exchange, token, account } = this.props
        await loadBalances(dispatch, web3, exchange, token, account )
    }
    render() {
        return (
 

 <div className="card bg-transparent text-white">
 <div className="card-header">
   Balance
 </div>
 <div className="card-body">
  {this.props.showForm ? showForm(this.props) : <Spinner />}
 
 </div>
</div>
   
   )
}
}

function mapStateToProps(state) {
    const balancesLoading = balancesLoadingSelector(state)
    
    //console.log('BALANCES LOADING ' ,balancesLoading)

   
    return {
      
        symbol: tokenSymbolLoadedSelector(state),
        exchange: exchangeSelector(state),
        account: accountSelector(state),
        token: tokenSelector(state),
        web3: web3Selector(state),
        etherBalance: etherBalanceSelector(state),
        tokenBalance: tokenBalanceSelector(state),
        exchangeEtherBalance: exchangeEtherBalanceSelector(state),
        exchangeTokenBalance: exchangeTokenBalanceSelector(state),
        balancesLoading,
        showForm:  !balancesLoading,
        etherDepositAmount: etherDepositAmountSelector(state),
        etherWithdrawAmount: etherWithdrawAmountSelector(state),
        tokenDepositAmount: tokenDepositAmountSelector(state),
        tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
        myOpenOrders: myOpenOrdersSelector(state),
        myTotalOpenOrders: myTotalOpenOrdersSelector(state),
        totalOrders:totalOrdersLoadedSelector(state)
    }
}

export default connect(mapStateToProps)(Balance)