import React, { Component } from 'react'
import { connect } from 'react-redux'
import { 
  loadWeb3, 
  loadAccount,  
  loadStacking
} from '../store/interactions'
import { 
  stackingLoadedSelector,
 } from '../store/selectors'
import {
 warningLoaded
} from '../store/actions'







class Nft extends Component {
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
        const stacking = await loadStacking(web3, networkId, dispatch)
        if(!stacking){
          const data = { msg: 'Could not load exchange contract', desc: 'Make sure that you are connected to the proper network and refresh the page'}
          dispatch(warningLoaded(data))
          } else {  
            // const token = await loadToken(web3, exchange, address, dispatch)// loadin token
            // if(!token){
            //   const data = { msg: 'Could not load token contract', desc: 'Make sure that you are connected to the proper network and refresh the page'}
            //   dispatch(warningLoaded(data))
            //    }
          }
         
    }
  }

  render() {
    return (
      <div >
       {/* { this.props.contractsLoaded ? <DefiContent />:
        <div className="container text-center text-white" ><h5>PLEASE CONNECT METAMASK TO THE RINKEBY NETWORK</h5><img className="rotate" alt="Loading..." src="../logo.svg"></img></div>
        } */}
      </div>
    )
  }
}
function mapStateToProps(state){
  return {
      contractsLoaded: stackingLoadedSelector(state)
  }
}
export default connect(mapStateToProps)(Nft);