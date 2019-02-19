import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            media: undefined,
            currentMedia: undefined
        };
        this.show = (page, currentMedia = {}) => this.setState({currentMedia});
        this.close = () => this.setState({currentMedia: undefined});
        this.updateMedia = async () => {
            this.setState({loading: true});
            const {error, data: media} = await API.request('media', 'list');
            if (!error)
                this.setState({loading: false, media});
            else
                Modal.send('ошибка при обновлении списка картинок, повторите попытку позже', Message.type.danger);
        };
        this.deleteMedia = async (mediaID = this.state.currentMedia._id) => {
            const {error} = await API.request('media', 'update', {_id: mediaID});
            if (error) Message.send('ошибка при удалении картиннки, повторите попытку позже', Message.type.danger);
            else {
                this.updateMedia();
                Message.send('картинка успешно удалена', Message.type.success);
            }
        };
        this.saveChanges = async () => {
            const {currentMedia} = this.state;
            const {error} = await API.request('media', 'update', currentMedia);
            if (error) {
                Message.send(`ошибка при редактировании картинки, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`картинка успешно изменена`, Message.type.success);
                this.close();
                this.updateMedia();
            }
        };
    }

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: media} = await API.request('media', 'list');
        if (!error)
            this.setState({loading: false, media});
        else
            Message.send('ошибка при получении списка категорий, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {media} = this.state;
        return media.map((img, key) => (
            <div className='a--list-item' key={key}>
                {img.categories && img.categories.map((category, key) => <div key={key}><a
                    href={category.url}>{category.name}</a></div>)}
                {img.products && img.products.map((product, key) => <div key={key}><a
                    href={product.url}>{product.name}</a></div>)}
                <img width='200' height='200' src={img.url} alt=''/>
                <span onClick={() => this.deleteMedia(img._id)} className='icon remove-button'/>
            </div>
        ))
    };

    render() {
        const {loading} = this.state;
        if (loading)
            return <Loading/>;
        return (
            <>
                {this.renderList()}
            </>
        )
    }
}