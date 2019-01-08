import React from 'react';
import {Redirect, withRouter} from 'react-router-dom';

import Modal from '@components/ui/modal';
import UserModel from '@models/user';

export default class Verify extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            message: 'Пожалуйста, подождите, выполняется подтверждение аккаунта'
        };
    };

    componentDidMount() {
        this.verification();
    };

    async verification() {
        const {id} = (this.props.match || {}).params || {};

        if (!await UserModel.verify(id))
            return;

        this.setState({message: 'Аккаунт успешно активирован'});
        setTimeout(() => this.setState({redirect: true}), 3000);
    };

    render() {
        const {redirect, message} = this.state;

        if (redirect)
            return (<Redirect to={{pathname: '/account'}}/>);

        return (
            <Modal title='Подтверждение аккаунта' show={true}>
                <div className='s--verify-modal'>
                    <div>{message}</div>
                </div>
            </Modal>
        );
    };
};