import React from 'react';

import API from '@common/core/api';
import Loading from '@components/ui/loading';
import Modal from '@components/ui/modal';
import Message from '@components/ui/message';
import Input from '@components/ui/input';

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            media: undefined,
            sendLoading: false, // we use this flag for rendering a spinner in the edit modal window because sending an image takes a lot of time
            currentMedia: undefined,
            show: undefined,
            filter: {}
        };
        this.show = (page, currentMedia = {}) => this.setState({show: page, currentMedia});
        this.close = () => this.setState({currentMedia: undefined, show: undefined});
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
            if (error)
                Message.send('ошибка при удалении картиннки, повторите попытку позже', Message.type.danger);
            else {
                this.updateMedia();
                Message.send('картинка успешно удалена', Message.type.success);
            }
        };
        this.saveChanges = async () => {
            this.setState({sendLoading: true});
            const {changes, currentMedia} = this.state;
            const data = {_id: currentMedia._id, changes};
            const {error} = await API.request('media', 'update', data);
            this.setState({sendLoading: false});
            if (error) {
                Message.send(`ошибка при редактировании картинки, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`картинка успешно изменена`, Message.type.success);
                this.close();
                this.updateMedia();
            }
        };
        this.acceptFilter = async (filterBy, value) => {
            const {filter} = this.state;
            let newFilter = {...filter};
            newFilter[filterBy] = (value || undefined);
            for (const filter in newFilter)
                if (newFilter[filter] === undefined)
                    delete newFilter[filter];
            if (!Object.keys(newFilter).length)
                newFilter = undefined;
            this.setState({filter: newFilter});
            const {error, data: media} = await API.request('media', 'list', {filter: newFilter});
            if (!error)
                this.setState({media});
            else
                Message.send('ошибка при обновлении списка логов, повторите попытку позже');
        };
        this.buttons = [
            {
                name: 'сохранить',
                types: 'primary',
                handler: this.saveChanges
            },
            {
                name: 'закрыть',
                types: 'secondary',
                handler: this.close
            }
        ];
        this.filters = ['product', 'category'];
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
                <span onClick={() => this.show('editPage', img)} className='icon pencil'/>
            </div>
        ))
    };

    render() {
        const {loading, show, currentMedia, changes = {}, sendLoading, filter = {}} = this.state;
        if (loading)
            return <Loading/>;
        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deletePage}];
        return (
            <>
                {this.filters.map((filterBy, key) => {
                    return (
                        <Input key={key} placeholder={filterBy} onChange={value => this.acceptFilter(filterBy, value)}
                               value={filter[filterBy] || ''}/>
                    );
                })}
                {this.renderList()}
                {show && (
                    <Modal title={(show === 'editPage') ? 'Редактирование' : 'Создание'} show={true} buttons={actions}
                           onClose={this.close}>
                        <div>
                            <img src={changes.url || currentMedia.url} width='200' height='200' alt=''/>
                            <input type='file' onChange={e => {
                                const file = e.target.files[0];
                                if (file.size < 10 * 1024 * 1024) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        const dataURL = reader.result;
                                        if (show === 'editPage')
                                            this.setState({changes: {...changes, url: dataURL}});
                                        else
                                            this.setState({currentMedia: {...currentMedia, url: dataURL}});
                                    };
                                    reader.readAsDataURL(file);
                                } else
                                    Message.send('файл слишком большой', Message.types.danger);
                            }}/>
                            {sendLoading && <Loading/>}
                        </div>
                    </Modal>
                )}
            </>
        )
    }
}