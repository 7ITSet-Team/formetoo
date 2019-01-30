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
            pagesList: undefined,
            show: undefined,
            currentPage: undefined,
            changes: undefined
        };
        this.show = (page, currentPage) => this.setState({currentPage: (currentPage || {}), show: page});
        this.close = () => this.setState({show: undefined, currentPage: undefined, changes: undefined});
        this.updatePagesList = async () => {
            this.setState({loading: true});
            const {error, data: pagesList} = await API.request('pages', 'list');
            if (!error)
                this.setState({loading: false, pagesList});
            else
                Message.send('ошибка при обновлении списка страниц, повторите попытку позже');
        };
        this.deletePage = async pageID => {
            const {currentPage, show} = this.state;
            const {error} = await API.request('pages', 'update', {_id: (pageID || currentPage._id)});
            if (!error) {
                if (show === 'editPage')
                    this.close();
                this.updatePagesList();
                Message.send('страница успешно удалена', Message.type.success);
            } else
                Message.send('ошибка при удалении страницы, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {currentPage, changes, show} = this.state;

            let data;
            if (show === 'editPage')
                data = {_id: currentPage._id, changes};
            else if (show === 'createPage') {
                data = currentPage;
                if (data.inMainMenu === undefined)
                    data.inMainMenu = false
            }

            const {error} = await API.request('pages', 'update', data);
            if (!error) {
                Message.send(`страница успешно ${((show === 'editPage') && 'изменена') || ((show === 'createPage') && 'создана')}`, Message.type.success);
                this.close();
                this.updatePagesList();
            } else {
                Message.send(`ошибка при ${((show === 'editPage') && 'редактировании') || ((show === 'createPage') && 'создании')} страницы, повторите попытку позже`, Message.type.danger);
                this.close();
            }
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
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: pagesList} = await API.request('pages', 'list');
        if (!error)
            this.setState({loading: false, pagesList});
        else
            Message.send('ошибка при получении списка страниц, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {pagesList} = this.state;
        return (
            <>
                {pagesList && pagesList.map((page, key) => (
                    <div key={key}>
                        {page.name}
                        <span onClick={() => this.show('editPage', page)} className='icon pencil'/>
                        <span onClick={() => this.deletePage(page._id)} className='icon remove-button'/>
                    </div>
                ))}
            </>
        )
    };

    renderPropCheckBox(prop, key) {
        const {currentPage, changes, show} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <input type='checkbox' defaultChecked={show === 'editPage' ? currentPage[prop] : false}
                       onChange={e => this.setState({
                           currentPage: {...currentPage, inMainMenu: e.target.checked},
                           changes: (show === 'editPage') ? {
                               ...changes,
                               inMainMenu: e.target.checked
                           } : undefined
                       })}/>
            </div>
        )
    };

    renderProp(prop, key) {
        const {currentPage, changes, show} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input value={(show === 'editPage') ? currentPage[prop] : undefined}
                       onChange={value => this.setState({
                           currentPage: {...currentPage, [prop]: value},
                           changes: (show === 'editPage') ? {...changes, [prop]: value} : undefined
                       })}/>
            </div>
        )
    };

    render() {
        const {loading, show, currentPage} = this.state;

        if (loading)
            return <Loading/>;

        let actions = this.buttons;
        if (show === 'editPage')
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deletePage}];

        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {this.renderList()}
                <Modal title='Редактирование' show={(show === 'editPage')} buttons={actions} onClose={this.close}>
                    <div>
                        {Object.keys(currentPage || {}).map((prop, key) => ((prop !== '_id') && (prop === 'inMainMenu')
                            ? this.renderPropCheckBox(prop, key)
                            : this.renderProp(prop, key))
                        )}
                    </div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={this.buttons} onClose={this.close}>
                    <div>
                        {['content', 'name', 'position', 'slug', 'title', 'inMainMenu'].map((prop, key) => (prop === 'inMainMenu')
                            ? this.renderPropCheckBox(prop, key)
                            : this.renderProp(prop, key)
                        )}
                    </div>
                </Modal>
            </>
        );
    };
};