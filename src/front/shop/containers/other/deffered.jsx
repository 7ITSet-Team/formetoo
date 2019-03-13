import React from 'react';

export default class Deffered extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    render() {
        const {count = 1} = this.state;
        return (
            <>
                <div className={`s--deffered ${count ? 'active' : ''}`}>
                    <span className='icon heart'/>
                    {count ? (<span className='c--badge'>{count}</span>) : null}
                    <span>Отложенные</span>
                </div>
                {/*modal deffered UI*/}
            </>
        );
    };
};