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
            categoriesList: undefined,
            currentCategory: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentCategory) => this.setState({show: page, currentCategory: (currentCategory || {})});
        this.close = () => this.setState({show: undefined, currentCategory: undefined, changes: undefined});
        this.updateCategoriesList = async () => {
            this.setState({loading: true});
            const {error, data: categoriesList} = await API.request('categories', 'list');
            if (!error)
                this.setState({loading: false, categoriesList});
            else
                Modal.send('ошибка при обновлении списка категорий, повторите попытку позже', Message.type.danger);
        };
        this.deleteCategory = async categoryID => {
            const {currentCategory, show} = this.state;
            const {error} = await API.request('categories', 'update', {_id: (categoryID || currentCategory._id)});
            if (error)
                Message.send('ошибка при удалении категории, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage')
                    this.close();
                this.updateCategoriesList();
                Message.send('категория успешно удалена', Message.type.success);
            }
        };
        this.saveChanges = async () => {
            const {currentCategory, changes, show} = this.state;
            if ((show === 'editPage') && (Object.keys(changes || {}).length === 0))
                return this.close();
            let data = currentCategory;
            if (show === 'editPage')
                data = {_id: currentCategory._id, changes};
            const {error} = await API.request('categories', 'update', data);
            if (error) {
                Message.send(`ошибка при ${(show === 'editPage') ? 'редактировании' : 'создании'} категории, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`категория успешно ${(show === 'editPage') ? 'изменен' : 'создан'}`, Message.type.success);
                this.close();
                this.updateCategoriesList();
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
    }

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: categoriesList} = await API.request('categories', 'list');
        if (!error)
            this.setState({loading: false, categoriesList});
        else
            Message.send('ошибка при получении списка категорий, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {categoriesList} = this.state;
        return (categoriesList || []).map((category, key) => (
            <div className='a--list-item' key={key}>
                <span>{category.name}</span>
                <span onClick={() => this.show('editPage', category)} className='icon pencil'/>
                {(category.slug !== 'root') &&
                <span onClick={() => this.deleteCategory(category._id)} className='icon remove-button'/>}
            </div>
        ))
    };

    renderPropMedia(prop, key) {
        const {currentCategory, changes, show} = this.state;
        return (
            <div key={key}>
                {((changes && changes[prop]) || (currentCategory && currentCategory[prop]))
                    ? (
                        <>
                            <img src={((changes && changes[prop]) || currentCategory[prop])}/>
                            <div className="icon remove-button" onClick={() => {
                                const newChanges = {...(changes || {})};
                                delete newChanges.img;
                                if (show === 'editPage')
                                    this.setState({changes: newChanges});
                                else if (show === 'createPage')
                                    this.setState({currentCategory: {...currentCategory, ...newChanges}})
                            }}/>
                        </>
                    )
                    : (
                        <button>add image</button>
                    )}
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'img')
            return this.renderPropMedia(prop, key);
        const {currentCategory, show, changes} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                {
                    ((prop === 'slug') && currentCategory && (currentCategory.slug === 'root'))
                        ? <Input value='root' onChange={() => {
                        }}/>
                        : (
                            <Input
                                value={(show === 'editPage') ? ((changes && changes[prop]) || currentCategory[prop]) : undefined}
                                onChange={value => {
                                    const newChanges = {...(changes || {})};
                                    newChanges[prop] = value;
                                    if (show === 'editPage')
                                        this.setState({changes: newChanges});
                                    else if (show === 'createPage')
                                        this.setState({currentCategory: {...currentCategory, ...newChanges}});
                                }}/>
                        )
                }
            </div>
        )
    };

    renderProps() {
        return ['slug', 'name', 'img'].map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show, currentCategory} = this.state;
        if (loading)
            return <Loading/>;
        let actions = this.buttons;
        if ((show === 'editPage') && (currentCategory.slug !== 'root'))
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteCategory}];
        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {this.renderList()}
                <Modal title='Редактирование' show={(show === 'editPage')} buttons={actions} onClose={this.close}>
                    <div>{this.renderProps()}</div>
                </Modal>
                <Modal title='Создание' show={(show === 'createPage')} buttons={actions} onClose={this.close}>
                    <div>{this.renderProps()}</div>
                </Modal>
            </>
        )
    }
}