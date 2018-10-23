import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';

import './index.less';

import App from './app';

ReactDOM.hydrate(<BrowserRouter basename='/'><App/></BrowserRouter>, document.getElementById('app'));