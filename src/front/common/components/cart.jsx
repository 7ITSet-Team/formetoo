import React from 'react';
import {Link} from 'react-router-dom';

import Dropdown from '@components/ui/dropdown';
import API from '@shop/core/api';

export default class Cart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            count: undefined,
            sum: undefined
        };
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data = {}} = await API.request('cart', 'info');
        if (!error) {
            const {products = [], count, sum} = data;
            this.setState({products, count, sum});
        }
    };

    render() {
        const {products, count, sum} = this.state;
        return (
            <Dropdown open='false' className='user_btn lng_btn' icon={false}>
                <div className='toggle btn-group' role='toggle'>
                    <div className="c--cart">
                        <span className='icon cart'/>
                        <div>
                            {(products.length > 0) ? (
                                <>
                                <div>
                                    <span className='icon gift-box'/>
                                    <span>{count}</span>
                                </div>
                                <div>
                                    <span className='icon money'/>
                                    <span>{sum}</span>
                                </div>
                                </>
                            ) : (
                                <>
                                <div>
                                    Корзина
                                </div>
                                <div>
                                    пуста
                                </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className='content-wrapper' role='content'>
                    {(products.length > 0) ? (
                        products.map((item, key) => (
                            <div key={key} className='item'>
                                <Link to={`/catalog/product/${item.slug}`}>{item.name}</Link>
                                <div>
                                    <input value={item.count}/>
                                    *
                                    <span>{item.price}</span>
                                    =
                                    <span>{item.count * item.price}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                        <div>
                            Корзина
                        </div>
                        <div>
                            пуста
                        </div>
                        </>
                    )}
                </div>
            </Dropdown>
        );
    };
};