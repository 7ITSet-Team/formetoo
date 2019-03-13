import React from 'react';
import {Link, Redirect} from 'react-router-dom';

import Modal from '@components/ui/modal';
import Input from '@components/ui/input';
import Message from '@components/ui/message';
import Dropdown from '@components/ui/dropdown';
import UserModel from '@models/user';

export default class Forgot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            any: ''
        };

        this.show = e => this.setState({show: true});
        this.close = e => this.setState({show: false});
        this.sendEmailOnForgot = async e => {
            let {any} = this.state;
            any = any.trim();

            let anyType = undefined;
            if (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(any))
                anyType = 'email';
            if (!anyType && /^[0-9]+$/.test(any))
                anyType = 'phone';
            if (!anyType)
                return Message.send('Некорректное значение', Message.type.danger);

            const success = await UserModel.forgot({
                type: anyType,
                identificator: any
            });
            if (success)
                this.setState({show: false, any: ''});
        };
        this.buttons = [
            {
                name: 'восстановить пароль',
                types: 'success',
                handler: this.sendEmailOnForgot
            },
            {
                name: 'закрыть',
                types: 'danger',
                handler: this.close
            }
        ];
    };

    componentWillMount() {
        UserModel.listeners.add(this.update);
    };

    componentWillUnmount() {
        UserModel.listeners.delete(this.update);
    };

    render() {
        const {any, show} = this.state;

        return (
            <>
                <button onClick={this.show} className='c--btn secondary'>Забыли пароль?</button>
                <Modal title='Восстановление пароля' show={show} buttons={this.buttons} onClose={this.close}>
                    <div className='s--forgot-modal'>
                        <div>
                            Введите номер телефона или адрес электронной почты, указанный при регистрации.
                        </div>
                        <Input value={any} placeholder='почта * или телефон *' onChange={any => this.setState({any})}/>
                    </div>
                </Modal>
            </>
        );
    };
};