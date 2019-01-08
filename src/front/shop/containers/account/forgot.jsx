import React from 'react';
import {Link, Redirect} from 'react-router-dom';

import Modal from '@components/ui/modal';
import Input from '@components/ui/input';
import Message from '@components/ui/message';
import Dropdown from '@components/ui/dropdown';
import UserModel from '@models/user';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            email: '',
            password: '',
            confirm: '',
            redirect: false,
            authorised: false
        };

        this.update = user => this.setState({authorised: user.authorised});
        this.show = e => this.setState({show: true});
        this.close = e => this.setState({show: false});
        this.login = async e => {
            let {email, password, confirm} = this.state;
            email = email.trim();

            if (!email || !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email))
                return Message.send('некорректный почтовый адрес', Message.type.danger);
            if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(password))
                return Message.send('требования к паролю не выполнены', Message.type.danger);
            if (password !== confirm)
                return Message.send('пароль и его подтверждение не совпадают', Message.type.danger);

            const success = await UserModel.login({
                email,
                password: UserModel.getHash(email, password)
            });
            if (success)
                this.setState({
                    show: false,
                    email: '',
                    password: '',
                    confirm: '',
                    redirect: true
                });
        };
        this.buttons = [
            {
                name: 'Войти',
                types: 'primary',
                handler: this.login
            },
            {
                name: 'восстановить пароль',
                types: 'secondary',
                handler: e => {
                    this.close();
                    UserModel.forgot();
                }
            },
            {
                name: 'закрыть',
                types: 'secondary',
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
        const {show, email, password, confirm, redirect, authorised} = this.state;
        if (redirect)
            return (<Redirect to={{pathname: '/account'}}/>);

        if (authorised)
            return <Link to='/account' rel='nofollow'>Кабинет</Link>

        return (
            <div>
                <button onClick={this.show} className='c--btn c--btn--icon'>
                    <span className='icon plus-in-circle'/>
                    <span>Войти</span>
                </button>
                <Modal title='Авторизация' show={show} buttons={this.buttons} onClose={this.close}>
                    <div className='s--login-modal'>
                        <Input value={email} placeholder='почта *' type='email'
                               onChange={email => this.setState({email})}/>
                        <Input value={password} placeholder='пароль *' type='password'
                               onChange={password => this.setState({password})}
                               button={(
                                   <Dropdown open='false' icon={false}>
                                       <span className='icon question-in-circle' role='toggle'/>
                                       <span role='content'>латинские буквы в нижнем или верхнем регистре, цифры, знаки !@#$%^&* . Обязателен хотя бы один знак и одна цифра. Допустимая длина от 6 до 16 символов.</span>
                                   </Dropdown>
                               )}/>
                        <Input value={confirm} placeholder='подтверждение пароля *' type='password'
                               onChange={confirm => this.setState({confirm})}/>
                    </div>
                </Modal>
            </div>
        );
    };
};