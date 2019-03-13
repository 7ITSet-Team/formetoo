import React from 'react';
import {Link} from 'react-router-dom';

import Input from '@components/ui/input';

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            query: ''
        };
        this.onChange = value => this.setState({query: value});
    };

    render() {
        const {query} = this.state;
        const buttons = [
            <Link key='query' to={`/catalog?query=${query}`} className='icon search c--search-btn'/>,
            <span key='settings' className='icon settings'/>
        ];
        return (
            <Input className='lg negative' value={query} placeholder='Поиск' onChange={this.onChange}
                   buttons={buttons}/>
        );
    };
};