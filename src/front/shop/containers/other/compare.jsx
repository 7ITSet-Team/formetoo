import React from 'react';

export default class Compare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    render() {
        const {count = 1} = this.state;
        return (
            <>
                <div className={`s--compare ${count ? 'active' : ''}`}>
                    <span className='icon refresh'/>
                    {count ? (<span className='c--badge'>{count}</span>) : null}
                    <span>Сравнение</span>
                </div>
                {/*modal compare UI*/}
            </>
        );
    };
};