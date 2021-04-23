import React, { Component } from 'react'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import { 
    accountSelector,
    stackingSelector,
    stacksSelector,
    stackAmountSelector,
    web3Selector
 } from '../store/selectors'
import {  
    loadStackData,
    stackToken,
    unStackToken
} from '../store/interactions'
import{
    stackAmountChanged
} from '../store/actions'

const showStack = (props) => {

    const {
        stacking,
        dispatch,
        account,
        stacks,
        stackAmount,
        web3
       
    } = props
    return (
        <div className="container text-center" >
      
            {stacks.map( (stack,index)  => {
                return(
                    <div
                    key = {index}
                    className="text-white text-right stacking-pool"
                     > 
                        <div className="stacking-head">
                            <h6> {stack.name} ({stack.symbol}) </h6>
                        </div>
                        <div className="stacking-cardbg">
                 
                            <table className="table bg-transparent text-white table-sm small">
                                <tbody>
                                    <tr>
                                        <td>You have {web3.utils.fromWei(stack.stacked, 'ether')} ({stack.symbol}) Staked</td>
                                    </tr>
                                    <tr>
                                        <td>Pool Supply : {web3.utils.fromWei(stack.supply, 'ether')} ({stack.symbol}) </td>
                                    </tr>
                                </tbody>
                            </table>

                            <form  onSubmit={(event) => {
                                event.preventDefault()
                                stackToken(stacking, stack.tokenStack, account, stackAmount, index, web3, dispatch)
                             }}>
                                <div className="stack-form">
                                    <div className="stack-pending">{parseInt(web3.utils.fromWei(stack.pending, 'ether')).toFixed(3)}</div>
                                   
                                    <div className="stack-input">
                                    <input
                                        type="number"
                                        min="0.000000000000000001"
                                        step="0.000000000000000001"
                                        placeholder="Amount to stake"
                                        onChange={(e) => dispatch(stackAmountChanged(e.target.value))}
                                        className="form-control form-control-sm "
                                        required
                                    />
                                    </div>
            
                                    <br/>
                                </div>
       
                                <div className="stack-control">
                                    <div className="stack-btn">
                                        <button type="submit" className="btn btn-primary btn-block btn-sm btn-custom ">Stake</button> 
                                    </div>
                                    <div className="stack-btn">
                                        <button className="btn btn-primary btn-block btn-sm btn-custom "
                                                onClick={(event) => {
                                                event.preventDefault()
                                                unStackToken(stacking, account, stackAmount, index, web3, dispatch)}
                                                }>Unstake</button>
                                    </div>
            
                                </div> 

                             </form>        
                        </div>
                    </div>
                )
            } 
        
            )}


        </div>
    )

}


class DefiContent extends Component {
    componentDidMount() {
        this.loadBlockchainData(this.props)
    }

    async loadBlockchainData(props){
        
      const { dispatch, stacking, account} = props
        //Token added to load specific token orders
       
   await loadStackData(stacking, dispatch, account)
      
       //  console.log('TOKEN FROM CONTENT : ',token)
    }
    render() {
        return(
            <div>
            {this.props.stacking ? showStack(this.props) : <Spinner />}
           
           </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        account: accountSelector(state),
        stacking: stackingSelector(state),
        stacks: stacksSelector(state),
        stackAmount: stackAmountSelector(state),
        web3: web3Selector(state)
    }
}
export default connect(mapStateToProps)(DefiContent)