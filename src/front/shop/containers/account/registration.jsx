import React from 'react';

import Modal from '@components/ui/modal';
import Input from '@components/ui/input';
import Message from '@components/ui/message';
import Dropdown from '@components/ui/dropdown';
import UserModel from '@models/user';

export default class Registration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            email: '',
            phone: '',
            name: '',
            lastname: '',
            password: '',
            confirm: ''
        };
        this.show = e => this.setState({show: true});
        this.close = e => this.setState({show: false});
        this.register = async e => {
            let {email, phone, name, lastname, password, confirm} = this.state;
            email = email.trim();
            phone = phone.trim();
            name = name.trim();
            lastname = lastname.trim();

            if (!email || !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email))
                return Message.send('некорректный почтовый адрес', Message.type.danger);
            if (!phone || !/^[0-9]+$/.test(phone))
                return Message.send('некорректный номер телефона', Message.type.danger);
            if (!name)
                return Message.send('некорректное имя', Message.type.danger);
            if (!lastname)
                return Message.send('некорректная фамилия', Message.type.danger);
            if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(password))
                return Message.send('требования к паролю не выполнены', Message.type.danger);
            if (password !== confirm)
                return Message.send('пароль и его подтверждение не совпадают', Message.type.danger);

            const success = await UserModel.registration({
                email,
                phone,
                name,
                lastname,
                password: UserModel.getHash(email, password)
            });
            if (success)
                this.setState({
                    show: false,
                    email: '',
                    phone: '',
                    name: '',
                    lastname: '',
                    password: '',
                    confirm: ''
                });
            const {onRegister} = this.props;
            if (onRegister)
                onRegister();
        };
        this.buttons = [
            {
                name: 'зарегистрироваться',
                types: 'success',
                handler: this.register
            },
            {
                name: 'закрыть',
                types: 'danger',
                handler: this.close
            }
        ];
    };

    render() {
        const {show, email, phone, name, lastname, password, confirm} = this.state;
        return (
            <>
                <button onClick={this.show} className='c--btn secondary'>Регистрация</button>
                <Modal title='Регистрация' show={show} buttons={this.buttons} onClose={this.close}>
                    <div className='s--registration-modal'>
                        <Input value={email} placeholder='почта *' type='email'
                               onChange={email => this.setState({email})}/>
                        <Input value={phone} placeholder='телефон *' type='tel'
                               onChange={phone => this.setState({phone})}
                               buttons={(
                                   <Dropdown open='false' icon={false}>
                                       <span className='icon question-in-circle' role='toggle'/>
                                       <span role='content'>только цифры</span>
                                   </Dropdown>
                               )}/>
                        <Input value={name} placeholder='имя *' type='name'
                               onChange={name => this.setState({name})}/>
                        <Input value={lastname} placeholder='фамилия *' type='lastname'
                               onChange={lastname => this.setState({lastname})}/>
                        <Input value={password} placeholder='пароль *' type='password'
                               onChange={password => this.setState({password})}
                               buttons={(
                                   <Dropdown open='false' icon={false}>
                                       <span className='icon question-in-circle' role='toggle'/>
                                       <span role='content'>латинские буквы в нижнем или верхнем регистре, цифры, знаки !@#$%^&* . Обязателен хотя бы один знак и одна цифра. Допустимая длина от 6 до 16 символов.</span>
                                   </Dropdown>
                               )}/>
                        <Input value={confirm} placeholder='подтверждение пароля *' type='password'
                               onChange={confirm => this.setState({confirm})}/>
                    </div>
                </Modal>
            </>
        );
    };
};