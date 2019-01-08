import React from 'react';
import {Redirect, withRouter} from 'react-router-dom';

import Modal from '@components/ui/modal';
import Input from '@components/ui/input';
import Message from '@components/ui/message';
import Dropdown from '@components/ui/dropdown';
import UserModel from '@models/user';

export default class Recovery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            password: '',
            confirm: ''
        };
        this.changePassword = async e => {
            let {password, confirm} = this.state;
            const {id, email} = (this.props.match || {}).params||{};
            if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(password))
                return Message.send('требования к паролю не выполнены', Message.type.danger);
            if (password !== confirm)
                return Message.send('пароль и его подтверждение не совпадают', Message.type.danger);

            const success = await UserModel.changePassword({
                id,
                password: UserModel.getHash(email, password)
            });
            if (success)
                this.setState({redirect: true});
        };
        this.buttons = [
            {
                name: 'Подтвердить новый пароль',
                types: 'primary',
                handler: this.changePassword
            }
        ];
    };

    render() {
        const {redirect, password, confirm} = this.state;
        const {email} = (this.props.match || {}).params||{};

        if (redirect)
            return (<Redirect to={{pathname: '/'}}/>);

        return (
            <Modal title={`Изменение пароля для аккаунта ${email}`} show={true} buttons={this.buttons}>
                <div className='s--recovery-modal'>
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
        );
    };
};