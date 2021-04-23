import React, { Component } from 'react';
import { connect } from 'react-redux'
import { 
    exchangeSelector,
    tokenSelector,
    accountSelector
 } from '../store/selectors'
import { 
    loadAllOrders, 
    loadAllTokens, 
    subscribeToEvents,
    loadUser
} from '../store/interactions'
import Trades from './Trades'
import OrderBook from './OrderBook'
import MyTransactions from './MyTransactions'
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'
import Market from './Market'
//import { loadUser } from '../store/actions';

class Content extends Component {
    componentDidMount() {
        this.loadBlockchainData(this.props)
    }

    async loadBlockchainData(props){
        
      const { dispatch, exchange, token, account } = props
        //Token added to load specific token orders
      
        await subscribeToEvents(exchange, dispatch)
         await loadAllTokens(exchange, dispatch).then( async () => {
            await loadAllOrders(exchange, dispatch, token)
         })
         await loadUser(exchange, account, dispatch)
        
      
       //  console.log('TOKEN FROM CONTENT : ',token)
    }
    render() {
        return (
            <div className="exchange" >
                <div className="vertical-split">
                    <Balance />
                    <NewOrder />
                </div>
                <OrderBook />
                <div className="vertical-split">
                    <PriceChart />
                    <MyTransactions />
                </div>
                <div className="vertical-split">
                <Trades />
                <Market />
               
                </div>

            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        exchange: exchangeSelector(state),
        token: tokenSelector(state),
        account: accountSelector(state)
    }
}
export default connect(mapStateToProps)(Content)