import React, { Component } from 'react';
import './App.css';
import Content from './Content'
import { connect } from 'react-redux'
import { 
  loadWeb3, 
  loadAccount, 
  loadToken, 
  loadExchange, 
  loadTokenSymbol,
} from '../store/interactions'
import { 
   contractsLoadedSelector,
 } from '../store/selectors'
import {
 warningLoaded
} from '../store/actions'
class Dex extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }
  async loadBlockchainData(dispatch) {
    const web3 = loadWeb3(dispatch)
    if(!web3){
        const data = { msg: 'Not connected to the network', desc: 'Please Download Metamask to acces this exchange and connect it to the proper network'}
        dispatch(warningLoaded(data))
    } else {
        await web3.eth.net.getNetworkType() 
        const networkId = await web3.eth.net.getId()
        await loadAccount(web3, dispatch)
        const exchange = await loadExchange(web3, networkId, dispatch)
        if(!exchange){
          const data = { msg: 'Could not load exchange contract', desc: 'Make sure that you are connected to the proper network and refresh the page'}
          dispatch(warningLoaded(data))
          } else {  
            let address = 0 // no adress set yet for token will load default
            const token = await loadToken(web3, exchange, address, dispatch)// loadin token
            if(!token){
              const data = { msg: 'Could not load token contract', desc: 'Make sure that you are connected to the proper network and refresh the page'}
              dispatch(warningLoaded(data))
               } else {
                await loadTokenSymbol(token, dispatch)
               }
          }
    }
  }

  render() {
    return (
      <div >
       { this.props.contractsLoaded ? <Content /> :
        <div className="container text-center text-white" ><h5>PLEASE CONNECT METAMASK TO THE RINKEBY NETWORK</h5><img className="rotate" alt="Loading..." src="../logo.svg"></img></div>
        }
      </div>
    )
  }
}
function mapStateToProps(state){
  return {
      contractsLoaded: contractsLoadedSelector(state)
  }
}
export default connect(mapStateToProps)(Dex);