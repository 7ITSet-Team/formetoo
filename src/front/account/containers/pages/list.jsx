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
        this.close = () => this.setState({
            show: {editPage: false, createPage: false},
            currentPage: undefined
        });
        this.updatePagesList = async () => {
            const {error, data: pagesList} = await API.request('pages', 'list');
            if (!error)
                this.setState({loading: false, pagesList});
            else
                Message.send('ошибка при обновлении списка страниц, повторите попытку позже');
        };
        this.deleteProduct = async pageID => {
            const {currentPage, show} = this.state;
            pageID = pageID ? pageID : currentPage._id;
            const {error} = await API.request('pages', 'update', {_id: pageID});
            if (error)
                Message.send('ошибка при удалении страницы, повторите попытку позже', Message.type.danger);
            else {
                show.editPage && this.setState({show: {editPage: false, createPage: false}});
                this.updatePagesList();
                Message.send('страница успешно удалена', Message.type.success);
            }
        };
        this.saveChanges = async () => {
            const {currentPage, changes, show} = this.state;

            let data;
            show.editPage && (data = {_id: currentPage._id, changes: changes || {}});
            show.createPage && (data = currentPage);

            const {error} = await API.request('pages', 'update', data);

            if (error) {
                Message.send(`ошибка при ${(show.editPage && 'редактировании') || (show.createPage && 'создании')} страницы, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`страница успешно ${(show.editPage && 'изменена') || (show.createPage && 'создана')}`, Message.type.success);
                this.close();
                this.setState({loading: true});
                this.updatePagesList();
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
            return (<Loading/>);

        let actions = this.buttons;
        actions = !show.editPage
            ? actions
            : [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteProduct}];

        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {pagesList.map((page, key) => (
                    <div key={key}>
                        {page.name}
                        <span onClick={() => this.show('editPage', page)} className='icon pencil'/>
                        <span onClick={() => this.deleteProduct(page._id)} className='icon remove-button'/>
                    </div>
                ))}
                <Modal title='Редактирование' show={show.editPage} buttons={actions} onClose={this.close}>
                    <div>
                        <span>Отображать в главном меню?</span>
                        {currentPage && (
                            <>
                                <input type="checkbox" defaultChecked={currentPage.inMainMenu}
                                       onChange={e => this.setState({
                                           currentPage: {...currentPage, inMainMenu: e.target.checked},
                                           changes: {...changes, inMainMenu: e.target.checked}
                                       })}/>
                                {Object.keys(currentPage).map((prop, key) => (
                                    <div key={key}>
                                        {prop !== '_id' && prop !== 'inMainMenu' /*временно*/ && (
                                            <>
                                                <span>{prop}</span>
                                                <Input value={currentPage[prop]}
                                                       onChange={value => {
                                                           show.editPage && this.setState({
                                                               currentPage: {...currentPage, [prop]: value},
                                                               changes: {...changes, [prop]: value}
                                                           });
                                                           show.createPage && this.setState({
                                                               currentPage: {...currentPage, [prop]: value}
                                                           });
                                                       }}/>
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
                        <span>Показывать в главном меню?</span>
                        <input type='checkbox'
                               onChange={e => this.setState({
                                   currentPage: {...currentPage, inMainMenu: e.target.checked}
                               })}/>
                        {/*загадочный массив - наименование свойств страниц. потом пределаю*/}
                        {['content', 'name', 'position', 'slug', 'title'].map((prop, key) => (
                            <div key={key}>
                                <span>{prop}</span>
                                <Input onChange={value => this.setState({
                                    currentPage: {
                                        ...currentPage,
                                        [prop]: value
                                    }
                                })}/>
                            </div>
                        ))}
                    </div>
                </Modal>
            </>
        );
    };
};