import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css';
import './components/App.css';
import App from './components/App.js';
import { Provider } from 'react-redux'
import configureStore from './store/configureStore'
import * as serviceWorker from './serviceWorker';


ReactDOM.render(
  <Provider store = {configureStore()}>
    <BrowserRouter>
     <App />
    </BrowserRouter>
    </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
