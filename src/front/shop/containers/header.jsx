import React from 'react';

import Logo from '@components/ui/logo';
import Search from '@shop/containers/other/search';
import Cart from '@shop/containers/other/cart';
import Deffered from '@shop/containers/other/deffered';
import Compare from '@shop/containers/other/compare';
import Login from '@shop/containers/account/login';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
    };

    data = {
        userLocation: 'Москва',
        address: 'ул. Скотопрогонная, 35с6',
        phone: '+7-(495)-378-92-96',
        viber: '89201234567',
        whatsapp: '89201234567',
        email: 'mail@mail.mail',
        count: 7,
        cost: 130000,
        timesheet: 'пн-пт:09:00-18:00',
        currency: 'RUB'
    };

    render() {
        const {userLocation, address, phone, count, cost, timesheet, viber, whatsapp, email, currency} = this.data;
        return (
            <header className='s--header'>
                <div className='firstline'>
                    <div className='region'>
                        <div>
                            <span className='icon map_marker'/>
                            <span>{userLocation}</span>
                            <span className='icon angle_down'/>
                        </div>
                        <div>
                            <span>{address}</span>
                            <span>карта</span>
                        </div>
                    </div>
                    <div className='actions'>
                        <div className='communication'>
                            <div className='base'>
                                <div>
                                    {phone}
                                </div>
                                <div>
                                    {timesheet}
                                </div>
                            </div>
                            <a className='whatsapp' href={`https://api.whatsapp.com/send?phone=${whatsapp}#`}>
                                <span className='icon whatsapp'/>
                            </a>
                            <a className='viber' href={`viber://chat?number=${viber}#`}>
                                <span className='icon viber'/>
                            </a>
                            <a className='email' href={`mailto:${email}`}>
                                <span className='icon email'/>
                                <span>{email}</span>
                            </a>
                        </div>
                        <div className='main'>
                            <div className='currency'>
                                <span>Валюта:</span>
                                <span>{currency}</span>
                                <span className='icon angle_down'/>
                            </div>
                            <Login/>
                        </div>
                    </div>
                </div>
                <div className='secondline'>
                    <div className='logo'>
                        <Logo/>
                    </div>
                    <div className='actions'>
                        <Search/>
                        <Deffered/>
                        <Compare/>
                        <Cart count={count} cost={cost}/>
                    </div>
                </div>
            </header>
        );
    };
};