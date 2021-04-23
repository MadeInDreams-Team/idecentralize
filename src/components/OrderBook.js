import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  orderBookSelector,
  orderBookLoadedSelector,
  tokenSymbolLoadedSelector,
  exchangeSelector,
  accountSelector,
  orderFillingSelector,
  exchangeTokenBalanceSelector,
  exchangeEtherBalanceSelector,
  web3Selector, 
  tokenSelector, 
 
} from '../store/selectors'
import { fillOrder } from '../store/interactions'


const renderOrder = (order, props) => {
  const { dispatch, exchange, account,exchangeTokenBalance, exchangeEtherBalance, symbol, web3, token } = props
  

  return(
   <OverlayTrigger
   trigger={['hover', 'focus']}
      key={order.id}
      placement='top'
      overlay={
        <Tooltip className="tooltip" id={order.id}>
          {`Click to ${order.orderFillAction}`}
        </Tooltip>
      }
    >
      <tr
        key={order.id}
        className="order-book-order"
       onClick={(e) => fillOrder(dispatch, exchange, order, account,exchangeTokenBalance, exchangeEtherBalance, symbol, web3, token)}
      >
        <td>{order.tokenAmount}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
        <td>{order.etherAmount}</td>
      </tr>
    </OverlayTrigger>
  )
}

const showOrderBook = (props) => {
  const { orderBook, symbol } = props

  return(
    <tbody>
      {orderBook.sellOrders.map((order) => renderOrder(order, props))}
      <tr>
        <th>{symbol}</th>
        <th>{symbol}/ETH</th>
        <th>ETH</th>
      </tr>
      {orderBook.buyOrders.map((order) => renderOrder(order, props))}
    </tbody>
  )
}

class OrderBook extends Component {
  render() {
     // console.log(this.props.showOrderBook, this.props.orderBook)
    return (
      <div className="vertical">
        <div className="card bg-transparent text-white">
          <div className="card-header">
            Order Book
          </div>
          <div className="card-body order-book">
            <table className="table bg-transparent text-white table-sm small">
              { this.props.showOrderBook ? showOrderBook(this.props) : <Spinner type='table' /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state) 
  const orderFilling = orderFillingSelector(state)


  return {
    orderBook: orderBookSelector(state),
    showOrderBook: orderBookLoaded && !orderFilling,
    symbol: tokenSymbolLoadedSelector(state),
    exchange: exchangeSelector(state),
    account: accountSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    token: tokenSelector(state),
    web3: web3Selector(state),
  }
}

export default connect(mapStateToProps)(OrderBook);










