import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'
import {
    myFilledOrdersLoadedSelector,
    myFilledOrdersSelector,
    myOpenOrdersLoadedSelector,
    myOpenOrdersSelector,
    tokenSymbolLoadedSelector,
    exchangeSelector,
    accountSelector,
    orderCancellingSelector, 
    
    
} from '../store/selectors'
import { cancelOrder } from '../store/interactions'

const showMyFilledOrders = (props) => {
  const { myFilledOrders } = props
    return(
      <tbody>
        { myFilledOrders.map((order) => {
          return (
            <tr key={order.id}>
              <td className="text-muted">{order.formattedTimestamp}</td>
              <td className={`text-${order.orderTypeClass}`}>{order.orderSign}{order.tokenAmount}</td>
              <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
            </tr>
          )
        }) }
      </tbody>
    )
  }
  
  const showMyOpenOrders = (props) => {
    const { myOpenOrders, dispatch, exchange, account } = props
    return(
      <tbody>
        { myOpenOrders.map((order) => {
          return (
            <tr key={order.id}>
              <td className={`text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
              <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
              <td
               className="cancel-order"
               onClick = {(e) => {
                 cancelOrder(dispatch, exchange, order, account)
               }}

              >&#8864;</td>
            </tr>
          )
        }) }
      </tbody>
    )
  }
  
  

class MyTransactions extends Component {
  render() {
  
    return (
        <div className="card bg-transparent text-white">
        <div className="card-header">
          My Transactions
        </div>
        <div className="card-body">
          <Tabs defaultActiveKey="trades" className="text-white tabs">
            <Tab eventKey="trades" title="Trades" className="bg-transparent tabs">
              <table className="table bg-transparent text-white table-sm small">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>
                    {this.props.symbol}
                    </th>
                    <th>{this.props.symbol}/ETH</th>
                  </tr>
                </thead>
                { this.props.showMyFilledOrders ? showMyFilledOrders(this.props) : <Spinner type="table" />} 
              </table>
            </Tab>
            <Tab eventKey="orders" title="Orders" className="text-white tabs">
              <table className="table bg-transparent text-white table-sm small">
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>{this.props.symbol}/ETH</th>
                    <th>Cancel</th>
                  </tr>
                </thead>
                { this.props.showMyOpenOrders ? showMyOpenOrders(this.props) : <Spinner type="table" />}
              </table>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
 const myOpenOrdersLoaded = myOpenOrdersLoadedSelector(state)
 const orderCancelling = orderCancellingSelector(state)
 
  return {
    myFilledOrders: myFilledOrdersSelector(state),
    showMyFilledOrders: myFilledOrdersLoadedSelector(state),
    myOpenOrders: myOpenOrdersSelector(state),
    showMyOpenOrders: myOpenOrdersLoaded && !orderCancelling,
    exchange: exchangeSelector(state),
    account: accountSelector(state),
    symbol: tokenSymbolLoadedSelector(state),
   
    
  }
}
export default connect(mapStateToProps)(MyTransactions);










