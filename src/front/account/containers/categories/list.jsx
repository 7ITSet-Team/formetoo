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
            sendLoading: false, // we use this flag for rendering a spinner (in the edit modal window) because sending an image takes a lot of time
            categories: undefined,
            currentCategory: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (page, currentCategory = {}) => this.setState({show: page, currentCategory});
        this.close = () => this.setState({show: undefined, currentCategory: undefined, changes: undefined});
        this.updateCategories = async () => {
            this.setState({loading: true});
            const {error, data: categories} = await API.request('categories', 'list');
            if (!error) this.setState({loading: false, categories});
            else Modal.send('ошибка при обновлении списка категорий, повторите попытку позже', Message.type.danger);
        };
        this.deleteCategory = async (categoryID = this.state.currentCategory._id) => {
            const {show} = this.state;
            const {error} = await API.request('categories', 'update', {_id: categoryID});
            if (error) Message.send('ошибка при удалении категории, повторите попытку позже', Message.type.danger);
            else {
                if (show === 'editPage') this.close();
                this.updateCategories();
                Message.send('категория успешно удалена', Message.type.success);
            }
        };
        this.saveChanges = async () => {
            const {currentCategory, changes = {}, show} = this.state;
            const isEdit = (show === 'editPage');
            if (isEdit && !Object.keys(changes).length) return this.close();
            let data = currentCategory;
            if (isEdit) data = {_id: currentCategory._id, changes};
            const isNotValid = ['slug', 'name']
                .map(prop => ((currentCategory[prop] == null) || (currentCategory[prop] === '')))
                .includes(true);
            if (!isEdit && isNotValid) return Message.send('Введены не все обязательные поля', Message.type.danger);
            this.setState({sendLoading: true});
            const {error} = await API.request('categories', 'update', data);
            this.setState({sendLoading: false});
            if (error) Message.send(`ошибка при ${isEdit ? 'редактировании' : 'создании'} категории, повторите попытку позже`, Message.type.danger);
            else {
                Message.send(`категория успешно ${isEdit ? 'изменен' : 'создан'}`, Message.type.success);
                this.updateCategories();
            }
            this.close();
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
        const {error, data: categories} = await API.request('categories', 'list');
        if (!error) this.setState({loading: false, categories});
        else Message.send('ошибка при получении списка категорий, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {categories = []} = this.state;
        return categories.map((category, key) => (
            <div className='a--list-item' key={key}>
                <span>{category.name}</span>
                <span onClick={() => this.show('editPage', category)} className='icon pencil'/>
                {(category.slug !== 'root') &&
                <span onClick={() => this.deleteCategory(category._id)} className='icon remove-button'/>}
            </div>
        ))
    };

    renderPropMedia(prop, key) {
        const {currentCategory = {}, changes = {}, show} = this.state;
        // here's crazy conditions
        const wasImgChanged = !!(changes[prop] || changes[prop] === '');
        const isExistInCategory = !!currentCategory[prop];
        const isExistInChanges = !!(changes[prop] && changes[prop] !== '');
        return (
            <div key={key}>
                {wasImgChanged
                    ? isExistInChanges && <img width='400' height='400' src={changes[prop].url} alt='img'/>
                    : isExistInCategory && <img width='400' height='400' src={currentCategory[prop].url} alt='img'/>}
                {(isExistInChanges || (isExistInCategory && !wasImgChanged)) && (
                    <span onClick={() => {
                        const newChanges = {...changes, [prop]: ''};
                        if (show === 'editPage') this.setState({changes: newChanges});
                        else if (show === 'createPage') this.setState({currentCategory: {...currentCategory, ...newChanges}});
                    }} className='icon remove-button'/>
                )}
                <input type='file' onChange={e => {
                    const file = e.target.files[0];
                    if (file.size < 10 * 1024 * 1024) {
                        const reader = new FileReader();
                        reader.onload = r => {
                            const dataURL = reader.result;
                            if (show === 'editPage') this.setState({
                                changes: {
                                    ...changes,
                                    img: {name: file.name, url: dataURL}
                                }
                            });
                            else this.setState({
                                currentCategory: {
                                    ...currentCategory,
                                    img: {name: file.name, url: dataURL}
                                }
                            });
                        };
                        reader.readAsDataURL(file);
                    } else Message.send('файл слишком большой', Message.types.danger);
                }}/>
            </div>
        )
    };

    renderProp(prop, key) {
        if (prop === 'img') return this.renderPropMedia(prop, key);
        const {currentCategory, show, changes = {}} = this.state;
        return (
            <div key={key}>
                <span>{prop}</span>
                {
                    ((prop === 'slug') && (currentCategory.slug === 'root'))
                        ? <Input value='root' onChange={() => undefined}/>
                        : (
                            <Input
                                value={(show === 'editPage') ? (changes[prop] || currentCategory[prop]) : undefined}
                                onChange={value => {
                                    const newChanges = {...changes, [prop]: value};
                                    if (show === 'editPage') this.setState({changes: newChanges});
                                    else if (show === 'createPage') this.setState({currentCategory: {...currentCategory, ...newChanges}});
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
        const {loading, show, currentCategory, sendLoading} = this.state;
        if (loading) return <Loading/>;
        let actions = this.buttons;
        if ((show === 'editPage') && (currentCategory.slug !== 'root'))
            actions = [...this.buttons, {name: 'удалить', types: 'danger', handler: this.deleteCategory}];
        return (
            <>
                <div className='c--items-group'>
                    <button className='c--btn c--btn--primary' onClick={() => this.show('createPage')}>add new</button>
                </div>
                {this.renderList()}
                {show && (
                    <Modal title={(show === 'editPage') ? 'Редактирование' : 'Создание'} show={true} buttons={actions}
                           onClose={this.close}>
                        <div>
                            {this.renderProps()}
                            {sendLoading && <Loading/>}
                        </div>
                    </Modal>
                )}
            </>
        )
    }
}