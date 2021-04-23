import React, { Component } from 'react';
import { connect } from 'react-redux'

//import Switch from 'react-bootstrap/esm/Switch';
import Navigator from './Navigator.js';

import Dex from './Dex.js';
import Defi from './Defi.js';
import Home from './Home.js';
import Popup from './Popup.js';
import Admin from './Admin.js';
import Nft from './Nft.js';
import './App.css'; 
import { 
  adminPanelSelector,
  warningSelector,
  contentLoadedSelector,
  contentDataLoadedSelector
 } from '../store/selectors.js';


 const renderContent = (props) => {
const {contentData} = props

  if(contentData === 'Dex'){
    return (
      <Dex/>
    )   
  }
  if(contentData === 'Defi'){
    return (
      <Defi/>
    )   
  }
  if(contentData === 'Nft'){
    return (
      <Nft/>
    )   
  }
  console.log('CONTENT : ',contentData)
 

 }

class App extends Component {

  componentDidMount(){
    
    this.loadAppData(this.props.dispatch)
  }
  async loadAppData(dispatch) {
 
  }

  render() {
    return (
<main>
<Navigator />
{this.props.warning ? <Popup/> : null} 
{this.props.admin.loaded ? <Admin/> : null} 
{this.props.content  ? renderContent(this.props) : null} 
{!this.props.content  ? <Home /> : null} 
 

</main>

)
    }
}

function mapStateToProps(state){
  
 
  
  return {
    
    warning: warningSelector(state),
    admin: adminPanelSelector(state),
    content: contentLoadedSelector(state),
    contentData: contentDataLoadedSelector(state)
  }
}

export default  connect(mapStateToProps)(App);
