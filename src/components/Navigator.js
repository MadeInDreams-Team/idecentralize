import React, { Component } from 'react';
import  {Navbar, Nav} from 'react-bootstrap'
import { connect } from 'react-redux'
import Spinner from './Spinner'
import Identicon from 'identicon.js';

import {
  
  exchangeSelector, 
  userSelector,
  accountSelector
} from '../store/selectors'
import {
 OpenAdminPanel,
 OpenContent

} from '../store/interactions'

const showAdminPanel = (props) => {
  const { user , dispatch } = props
  if(user.admin === true){
    return(
      <div className="admin-panel text-white text-xm">
      <button 
             className="btn btn-primary btn-block btn-sm btn-custom" 
             onClick={() => OpenAdminPanel(dispatch)}>Admin</button>  
        </div>  
      
    )

  }

  }



class Navigator extends Component {


  
  componentDidMount() {
    this.loadBlockchainData(this.props)
  }
  async loadBlockchainData(props) {
  
  }

  
  
  render() {
    var identiconOption={
      foreground: [186, 39, 127, 255],               // rgba black
      background: [0, 0, 0, 255],         // rgba white
      margin: 0.2,                              // 20% margin
      size: 420,                                // 420px square
      format: 'svg'                             // use SVG instead of PNG
    };
    return (

<Navbar account ={this.props.account} bg="transparent" variant="dark" collapseOnSelect expand="lg">
<Navbar.Brand className="brand">
  <img
    alt="Blockchain logo"
    src="../logo.svg"
    width="30"
    height="30"
    className="d-inline-block align-top brand"
  />Idecentralize
</Navbar.Brand>
<Navbar.Toggle aria-controls="responsive-navbar-nav" />
  <Navbar.Collapse id="responsive-navbar-nav">
    <Nav className="">
    <Nav.Link 
           
             onClick={() => OpenContent(this.props.dispatch, 'Dex')}>DEX</Nav.Link> 

     <Nav.Link 
             
             onClick={() => OpenContent(this.props.dispatch, 'Defi')}>DEFI</Nav.Link>   
     <Nav.Link 
             
             onClick={() => OpenContent(this.props.dispatch, 'Nft')}>NFT</Nav.Link>       

</Nav>

</Navbar.Collapse>
<div>
{ this.props.showAdminPanel ? showAdminPanel(this.props) : <Spinner type="table" />} 
</div>
{ this.props.account
              ? <img
                className='ml-2'
                width='30'
                height='30'
                alt={this.props.account}
                src={`data:image/svg+xml;base64,${new Identicon(this.props.account, identiconOption).toString()}`}
              />
              : <Spinner/>
            }
</Navbar>


);
}

}







function mapStateToProps(state) {
 
 
  return {
    showAdminPanel: userSelector(state),
    exchange: exchangeSelector(state),
    user: userSelector(state),
    account: accountSelector(state)
  }
}

export default connect(mapStateToProps)(Navigator)
