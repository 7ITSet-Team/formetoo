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
        this.show = (page, currentPage) => this.setState({
            currentPage: (currentPage || {inMainMenu: false}),
            show: page
        });
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
            if ((show === 'editPage') && (Object.keys(changes || {}).length === 0))
                return this.close();
            let data = currentPage;
            if (show === 'editPage')
                data = {_id: currentPage._id, changes};
            const {error} = await API.request('pages', 'update', data);
            if (!error) {
                Message.send(`страница успешно ${(show === 'editPage') ? 'изменена' : 'создана'}`, Message.type.success);
                this.close();
                this.updatePagesList();
            } else {
                Message.send(`ошибка при ${(show === 'editPage' ? 'редактировании' : 'создании')} страницы, повторите попытку позже`, Message.type.danger);
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
        return (pagesList || []).map((page, key) => (
            <div key={key}>
                {page.name}
                <span onClick={() => this.show('editPage', page)} className='icon pencil'/>
                <span onClick={() => this.deletePage(page._id)} className='icon remove-button'/>
            </div>
        ))
    };

    renderPropCheckBox(prop, key) {
        const {currentPage, show, changes} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <input type='checkbox'
                       defaultChecked={show === 'editPage' ? ((changes && changes[prop]) || currentPage[prop]) : false}
                       onChange={e => {
                           const newChanges = {...(changes || {})};
                           newChanges[prop] = e.target.checked;
                           if (show === 'editPage')
                               this.setState({changes: newChanges});
                           else if (show === 'createPage')
                               this.setState({currentPage: {...currentPage, ...newChanges}});
                       }}/>
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'inMainMenu')
            return this.renderPropCheckBox(prop, key);
        const {currentPage, show, changes} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                <Input value={(show === 'editPage') ? ((changes && changes[prop]) || currentPage[prop]) : undefined}
                       onChange={value => {
                           const newChanges = {...(changes || {})};
                           newChanges[prop] = value;
                           if (show === 'editPage')
                               this.setState({changes: newChanges});
                           else if (show === 'createPage')
                               this.setState({currentPage: {...currentPage, ...newChanges}});
                       }}/>
            </div>
        )
    };

    renderProps() {
        return ['content', 'name', 'position', 'slug', 'title', 'inMainMenu'].map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show} = this.state;
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
                    <div>{this.renderProps()}</div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={this.buttons} onClose={this.close}>
                    <div>{this.renderProps()}</div>
                </Modal>
            </>
        );
    };
};