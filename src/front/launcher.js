import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';

import App from './app';
import './index.less';

ReactDOM.hydrate(<BrowserRouter basename='/'><App/></BrowserRouter>, document.getElementById('app'));