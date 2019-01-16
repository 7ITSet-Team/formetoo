import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            rolesList: []
        };
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: rolesList} = await API.request('roles', 'list');
        if (!error) {
            this.setState({loading: false, rolesList});
        }
    };

    render() {
        const {loading, rolesList} = this.state;
        if (loading)
            return (<Loading/>);

        return rolesList.map((role, key) => (
            <div className='c--list-item' key={key}>
                <div>{role.name}</div>
                <div className='icon'></div>
            </div>
        ));
    };
};