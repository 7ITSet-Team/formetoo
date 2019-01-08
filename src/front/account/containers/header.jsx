import React from 'react';

import Logo from '@components/ui/logo';
import Search from '@components/search';
import Cart from '@components/cart';
import MainMenu from '@components/main-menu';
import Registration from '@shop/containers/account/registration';
import Login from '@shop/containers/account/login';

export default class Header extends React.Component {
    constructor(props) {
        super(props);
    };

    data = {
        userLocation: 'Москва',
        address: '127000, Москва, ул.Ленинградская, д.157, этаж 3, оф.378',
        phone: '+7-(495)-378-92-96',
        count: 7,
        cost: 130000
    };

    render() {
        const {userLocation, address, phone, count, cost} = this.data;
        return (
            <header className='s--header'>
                <div className='actions'>
                    <div>
						<span>
							Ваш город:
						</span>
                        <span>
							{` ${userLocation}`}
						</span>
                    </div>
                    <div>
                        {address}
                    </div>
                    <div>
                        {phone}
                    </div>
                    <div>
                        <Registration/>
                        <Login/>
                    </div>
                </div>
                <div className='search'>
                    <Logo/>
                    <Search/>
                    <Cart count={count} cost={cost}/>
                </div>
                <div className='menu'>
                    <MainMenu/>
                </div>
            </header>
        );
    };
};