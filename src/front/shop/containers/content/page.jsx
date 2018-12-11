import React from 'react';

import API from '@shop/core/api';
import Loading from '@components/ui/loading';

export default class Page extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            page: undefined
        };
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.match.params.slug !== prevProps.match.params.slug) {
            this.getInitialDataFromSrv();
        }
    };

    async getInitialDataFromSrv() {
        this.setState({loading: true, page: undefined});
        const {slug = ''} = this.props.match.params;
        const {error, data: page} = await API.request('content', 'page', {slug});
        if (!error) {
            this.setState({loading: false, page});
        }
    };

    render() {
        const {loading, page} = this.state;

        if (loading)
            return (<Loading/>);
        else if (page.title || page.content)
            return (
                <div className='s--page'>
                    {page.title ? (<h3>{page.title}</h3>) : null}
                    {page.content ? (<div dangerouslySetInnerHTML={{__html: page.content}}/>) : null}
                </div>
            );
        else
            return null;
    };
};