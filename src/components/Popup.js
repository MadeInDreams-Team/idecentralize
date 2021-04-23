import React, {Component} from 'react';  
import './App.css';  
import { connect } from 'react-redux'
import {
  warningSelector,
} from '../store/selectors'
import {
  UnloadWarning
} from '../store/interactions'

class Popup extends Component {  
    componentDidMount(){
        this.loadAppData(this.props.dispatch)
      }
      async loadAppData(dispatch) {
      
      }

     
      render() {  
        return (  
            <div className='popup'>  
            <div className='popupinner container'>  
            <h4 className="underline">{this.props.warning.msg}</h4> 
            <p>{this.props.warning.desc}</p> 
            {this.props.loaded}
             <button 
                    className="btn btn-primary btn-block btn-sm btn-custom" 
                    onClick={() => UnloadWarning(this.props.dispatch)}>Close</button>  
            </div>  
            </div>  
          )
        }
      }    
       

  
    function mapStateToProps(state){
     
        return { 
          warning: warningSelector(state)
        }
      }
      
      export default  connect(mapStateToProps)(Popup);