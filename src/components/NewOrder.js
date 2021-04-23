
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'

import { 
    tokenSymbolLoadedSelector,
    exchangeSelector,
    accountSelector,
    web3Selector,
    buyOrderSelector,
    sellOrderSelector, 
    tokenSelector
} from '../store/selectors'

import{
    buyOrderAmountChanged,
    buyOrderPriceChanged,
    sellOrderAmountChanged,
    sellOrderPriceChanged
} from '../store/actions'

import{
    makeBuyOrder,
    makeSellOrder
} from '../store/interactions'
const showForm = (props) => {
  const {
    dispatch,
    buyOrder,
    exchange,
    token,
    web3,
    account,
    sellOrder,
    symbol,
    showBuyTotal,
    showSellTotal
   
  } = props
  return(
    <Tabs className="selltabs" defaultActiveKey="buy" >
      <Tab eventKey="buy" title="Buy" className="bg-transparent text-success">
      <form onSubmit={(event) => {
            event.preventDefault()
            makeBuyOrder(dispatch, exchange, token, web3, buyOrder, account)
          }}>
          <div className="form-group small">
            <label >Buy Amount ({symbol})</label>
            <div className="input-group">
              <input
                type="number"
                min="0.000000000000000001"
                step="0.000000000000000001"
                className="form-control form-control-sm bg-transparent text-white"
                placeholder="Buy Amount"
            
                
                onChange={(e) => dispatch( buyOrderAmountChanged( e.target.value ) )}
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label >Buy Price</label>
            <div className="input-group">
              <input
                type="number"
                min="0.000000000000000001"
                step="0.000000000000000001"
                className="form-control form-control-sm bg-transparent text-white"
                placeholder="Buy Price"
                onChange={(e) => dispatch( buyOrderPriceChanged( e.target.value ) )}
                required
              />
            </div>
          </div>
          <div className="text-center">
          <button type="submit" className="btn btn-primary btn-sm btn-block btn-custom">Buy Order</button>
          </div>
          <div>
          { showBuyTotal ? <small>Total: {((((buyOrder.amount * buyOrder.price) * 10000000000000000) / 10000000000000000).toFixed(16).replace(/\.?0+$/,"")).toString()} ETH</small> : null }
          </div>
        </form>


      </Tab>
      <Tab eventKey="sell" title="Sell" className="bg-transparent text-danger">

     
      <form onSubmit={(event) => {
            event.preventDefault()
            makeSellOrder(dispatch, exchange, token, web3, sellOrder, account)
          }}>
          <div className="form-group small">
            <label>Sell Amount({symbol})</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-transparent text-white"
                placeholder="Sell Amount"
                onChange={(e) => dispatch( sellOrderAmountChanged( e.target.value ) )}
                required
              />
            </div>
          </div>
          <div className="form-group small">
            <label>Sell Price</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-sm bg-transparent text-white"
                placeholder="Sell Price"
                onChange={(e) => dispatch( sellOrderPriceChanged( e.target.value ) )}
                required
              />
            </div>
          </div>
          <div className="text-center">
          <button type="submit" className="btn btn-primary btn-sm btn-block btn-custom">Sell Order</button>
          </div>
          <div>
          {/* { showSellTotal ? <small>Total:  { (( (sellOrder.amount * sellOrder.price) * 100000) / 100000 ).toFixed(5)   } ETH</small> : null } */}
          { showSellTotal ? <small>Total: {((((sellOrder.amount * sellOrder.price) * 100000000000000000) / 100000000000000000).toFixed(16).replace(/\.?0+$/,"")).toString()} ETH</small> : null }
          </div>
        </form>
        </Tab>
    </Tabs>

  )
}

class NewOrder extends Component {
   render() {
      return (
 
<div className="card bg-transparent text-white">
    <div className="card-header">
      New Order
    </div>
    <div className="card-body">
    {this.props.showForm ? showForm(this.props) : <Spinner />}
     
    </div>
  </div>
   
   )
}
}



function mapStateToProps(state) {

  const buyOrder = buyOrderSelector(state)
  const sellOrder = sellOrderSelector(state)
  
   
    return {
      
        symbol: tokenSymbolLoadedSelector(state),
        account: accountSelector(state),
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        web3: web3Selector(state),
        buyOrder,
        sellOrder,
        showForm: !buyOrder.making && !sellOrder.making,
        showBuyTotal: buyOrder.amount && buyOrder.price,
        showSellTotal: sellOrder.amount && sellOrder.price
    }
}

export default connect(mapStateToProps)(NewOrder)