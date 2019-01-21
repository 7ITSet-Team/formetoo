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
            pagesList: [],
            show: {editPage: false},
            currentPage: undefined,
            changes: undefined
        };
        this.show = (page, current) => this.setState({currentPage: current, show: {[page]: true}});
        this.close = () => this.setState({show: {editPage: false, createPage: false}, currentPage: undefined});
        this.updatePagesList = async () => {
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
                if (show.editPage)
                    this.setState({show: {editPage: false, createPage: false}});
                this.updatePagesList();
                Message.send('страница успешно удалена', Message.type.success);
            } else
                Message.send('ошибка при удалении страницы, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {currentPage, changes, show} = this.state;

            let data;
            if (show.editPage)
                data = {_id: currentPage._id, changes: changes || {}};
            else if (show.createPage) {
                data = currentPage;
                if (data.inMainMenu === undefined)
                    data.inMainMenu = false
            }

            const {error} = await API.request('pages', 'update', data);
            if (!error) {
                Message.send(`страница успешно ${(show.editPage && 'изменена') || (show.createPage && 'создана')}`, Message.type.success);
                this.close();
                this.setState({loading: true});
                this.updatePagesList();
            } else {
                Message.send(`ошибка при ${(show.editPage && 'редактировании') || (show.createPage && 'создании')} страницы, повторите попытку позже`, Message.type.danger);
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

    render() {
        const {loading, pagesList, show, currentPage, changes} = this.state;
        if (loading)
            return <Loading/>;

        let actions = this.buttons;
        actions = show.editPage
            ? [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deletePage}]
            : actions;

        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {pagesList.map((page, key) => (
                    <div key={key}>
                        {page.name}
                        <span onClick={() => this.show('editPage', page)} className='icon pencil'/>
                        <span onClick={() => this.deletePage(page._id)} className='icon remove-button'/>
                    </div>
                ))}
                <Modal title='Редактирование' show={show.editPage} buttons={actions} onClose={this.close}>
                    <div>
                        {currentPage && (
                            <>
                                {Object.keys(currentPage).map((prop, key) => (
                                    <div key={key}>
                                        {prop !== '_id' && (
                                            <>
                                                <span>{prop}</span>
                                                {prop !== 'inMainMenu'
                                                    ? (
                                                        <Input value={currentPage[prop]}
                                                               onChange={value => this.setState({
                                                                   currentPage: {...currentPage, [prop]: value},
                                                                   changes: {...changes, [prop]: value}
                                                               })}/>
                                                    )
                                                    : (
                                                        <input type="checkbox" defaultChecked={currentPage[prop]}
                                                               onChange={e => this.setState({
                                                                   currentPage: {
                                                                       ...currentPage,
                                                                       inMainMenu: e.target.checked
                                                                   },
                                                                   changes: {...changes, inMainMenu: e.target.checked}
                                                               })}/>
                                                    )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </Modal>
                <Modal title='Создание' show={show.createPage} buttons={this.buttons} onClose={this.close}>
                    <div>
                        {/*загадочный массив - наименование свойств страниц*/}
                        {['content', 'name', 'position', 'slug', 'title', 'inMainMenu'].map((prop, key) => (
                            <div key={key}>
                                <span>{prop}</span>
                                {prop !== 'inMainMenu'
                                    ? (
                                        <Input onChange={value => this.setState({
                                            currentPage: {...currentPage, [prop]: value}
                                        })}/>
                                    )
                                    : (
                                        <input type='checkbox'
                                               onChange={e => this.setState({
                                                   currentPage: {...currentPage, inMainMenu: e.target.checked}
                                               })}/>
                                    )}
                            </div>
                        ))}
                    </div>
                </Modal>
            </>
        );
    };
};