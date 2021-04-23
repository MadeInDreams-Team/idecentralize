import React, { Component } from 'react';
import { connect } from 'react-redux'

 class Home extends Component {

    render() {
    return (

<div className="container">
    <h1 className="text-white underline">Hello Universe</h1>
    <p className="text-white">Idencentralize is a unique concept based on Ethereum networks where gaming and trading merge.
    We revamped the traditional trading and yield farming by adding a NFT that gives there holders some
    "Super Powers". They can be earned by participation, trades, and exchanges. I decentralize ultimate objective
    is to bring decentralization a step further with a DEX for ERC20 tokens and a Market Place for your NFTs. A Liquidity Pool
    where users can farm some Idencentralized token and use there super powers NFTs.

    </p>
    <div> </div>
</div>
);
}
}


function mapStateToProps(state) {
 

    return {
       
    }
  }
  
  export default connect(mapStateToProps)(Home)

