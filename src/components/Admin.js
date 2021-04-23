import React, {Component} from 'react';  
import './App.css';  
import { connect } from 'react-redux'

import {
  CloseAdminPanel,
  queryRegisterToken,
  registerToken
} from '../store/interactions'

import {
rTokenSelector,
exchangeSelector,
accountSelector,
web3Selector,
rTokenLoadedSelector
} from '../store/selectors'



const showData = (props) => {
    const {rtoken}=  props

    return(

        <div className="col-12 col-sm-auto pl-sm-0 admin">
            <table className="table bg-transparent text-white table-sm small">
                <tbody>
                    <tr>
                        <td className="text-right">Name:</td>
                        <td className="text-left">{rtoken.name}</td>
                    </tr>
                    <tr>
                        <td className="text-right">Symbol:</td>
                        <td className="text-left">{rtoken.symbol}</td>
                    </tr>
                    <tr>
                        <td className="text-right">Total Supply:</td>
                        <td className="text-left">{rtoken.totalSupply/(10**rtoken.decimals)}</td>
                    </tr>
                    <tr>
                        <td className="text-right">View on Etherscan:</td>
                        <td className="text-left"><a target="_blank" rel="noopener noreferrer" href={`https://etherscan.io/address/${rtoken.address}`}>{rtoken.address}</a></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )

} 

class Admin extends Component {  
    componentDidMount() {
        this.loadBlockchainData(this.props)
    }

    async loadBlockchainData(props){
        
      }
     
      render() {  
        return(
            <div className='popup'>  
            <div className='popupinner container '>  
            <h4 className="underline">Administration Panel</h4> 
            <h6>Token Registration</h6> 
            {this.props.rtokenLoaded ? 
            showData(this.props) : null} 
            <div className='admin'>
            <form className ="row" onSubmit={(event) => {
                event.preventDefault()
                registerToken( this.props.exchange, this.props.account,this.props.rtoken.address,  this.props.dispatch)
               
                
            }}>
                <div className="col-12 col-sm pr-sm-2">
                    <input
                    type="text"
                    min="42"
                    max="42"
                    placeholder='Contract Address'
                    // we check token info
                    onChange={(e) => queryRegisterToken(this.props.exchange, this.props.account, e.target.value, this.props.dispatch)}
                    className="form-control form-control-sm bg-transparent text-white"
                    required
                    />
                </div>
                <div className="col-12 col-sm-auto pl-sm-0">
                    <button type="submit" className="btn btn-primary btn-block btn-sm btn-custom">Register Token</button>
                </div>
            </form>

             <button 
                    className="btn btn-primary btn-block btn-sm btn-custom" 
                    onClick={() => CloseAdminPanel(this.props.dispatch)}>Close</button>  
            </div>  
            </div>
            </div>  
        )
        }
      }    
       

  
    function mapStateToProps(state){
       const showit = rTokenLoadedSelector(state)
        return { 
         rtokenLoaded: showit,   
         rtoken: rTokenSelector(state),
         exchange: exchangeSelector(state),
         account: accountSelector(state),
         web3: web3Selector(state),
        }
      }
      
      export default  connect(mapStateToProps)(Admin);