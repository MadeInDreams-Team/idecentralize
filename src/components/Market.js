import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  allTokensLoadedSelector,
  allTokensSelector,
  web3Selector,
  exchangeSelector,
  accountSelector,
  tokenSymbolLoadedSelector,
  tokenSelector
} from '../store/selectors'
import { addToMetamask, loadToken } from '../store/interactions'

const showTokens = ( props) => {
 const {allTokens, dispatch, exchange, web3, account } = props
 
     return (
   
         <tbody>

           {allTokens.map( (token)  => {
            return(
              <OverlayTrigger
                trigger={['hover', 'focus']}
                 key={token.tokenId}
                 placement='top'
                 overlay={
                  <Tooltip className="tooltip" id={token.TokenId}>
                     {`Click to load ${token.symbol} market`}
                  </Tooltip>
                 }
                 >
                 <tr 
                  key={token.tokenId}
                  className="order-book-order"
                   onClick={(e) => loadToken(web3, exchange, token.tokenAddress, dispatch, account)}
                    >
                    <td>{token.symbol}/ETH</td>
  
                 </tr>
                 </OverlayTrigger>
             )
         })}

       </tbody>
     )

}

class Market extends Component {
 
  render() {
    console.log(this.props.exchange)
    return (
      <div className="vertical">
        <div className="card bg-transparent text-white">
          <div className="card-header">
            Market
            <OverlayTrigger
                trigger={['hover', 'focus']}
                 key={this.props.symbol}
                 placement='top'
                 overlay={
                  <Tooltip className="tooltip" id={this.props.symbol}>
                     {`Click to add ${this.props.symbol} to metamask`}
                  </Tooltip>
                 }
                 >
                   <img className="metamask" src="../metamask.png" alt={`Click to add ${this.props.symbol} to metamask`}  onClick={(e) => addToMetamask(this.props.token)} />
                 </OverlayTrigger>
   
          </div>
          <div className="card-body order-book">
            <table className="table bg-transparent text-white table-sm small">
              { this.props.showTokens ? showTokens(this.props) : <Spinner type='table' /> }
            </table>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const tokensLoaded =  allTokensLoadedSelector(state)
  
  return {
    showTokens: tokensLoaded,
    allTokens: allTokensSelector(state),
    web3: web3Selector(state),
    exchange: exchangeSelector(state),
    account: accountSelector(state),
    symbol: tokenSymbolLoadedSelector(state),
    token: tokenSelector(state)
  }
}
export default connect(mapStateToProps)(Market);


