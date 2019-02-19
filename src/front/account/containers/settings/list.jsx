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
            settings: [],
            currentSetting: undefined,
            changes: undefined,
            show: undefined
        };
        this.show = (currentSetting = {}) => this.setState({show: true, currentSetting});
        this.close = () => this.setState({show: undefined, currentSetting: undefined, changes: undefined});
        this.updateSettings = async () => {
            this.setState({loading: true});
            const {error, data: settings} = await API.request('settings', 'list');
            if (!error)
                this.setState({loading: false, settings});
            else
                Modal.send('ошибка при обновлении списка настроек, повторите попытку позже', Message.type.danger);
        };
        this.saveChanges = async () => {
            const {changes = {}, currentSetting, show} = this.state;
            if (show && !Object.keys(changes).length)
                return this.close();
            const data = {_id: currentSetting._id, changes};
            const {error} = await API.request('settings', 'update', data);
            if (error) {
                Message.send(`ошибка при ${show ? 'редактировании' : 'создании'} настройки, повторите попытку позже`, Message.type.danger);
                this.close();
            } else {
                Message.send(`настройка успешно ${show ? 'изменена' : 'создана'}`, Message.type.success);
                this.close();
                this.updateSettings();
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
        this.fields = ['isPrivate', 'name', 'title', 'value'];
    };

    componentWillMount() {
        this.getInitialDataFromSrv();
    };

    async getInitialDataFromSrv() {
        const {error, data: settings} = await API.request('settings', 'list');
        if (!error)
            this.setState({loading: false, settings});
        else
            Message.send('ошибка при получении списка настроек, повторите попытку позже', Message.type.danger);
    };

    renderList() {
        const {settings} = this.state;
        return (
            <>
                {settings.map((setting, key) => (
                    <div className='a--list-item' key={key}>
                        <span>{setting.title}</span>
                        <span onClick={() => this.show(setting)} className='icon pencil'/>
                    </div>
                ))}
            </>
        )
    };

    renderProp(prop, key) {
        const {currentSetting, changes = {}} = this.state;
        return (
            <div key={key}>
                {prop}
                {prop === 'isPrivate'
                    ? <input type="checkbox"
                             checked={!(changes[prop] == null) ? changes[prop] : (currentSetting[prop] || false)}
                             disabled/>
                    : <Input value={!(changes[prop] == null) ? changes[prop] : (currentSetting[prop] || '')}
                             onChange={(prop === 'value')
                                 ? value => {
                                     const newChanges = {...changes, [prop]: value};
                                     this.setState({changes: newChanges});
                                 }
                                 : () => undefined}/>}
            </div>
        )
    };

    renderProps() {
        return this.fields.map((prop, key) => this.renderProp(prop, key));
    };

    render() {
        const {loading, show} = this.state;
        if (loading)
            return <Loading/>;
        return (
            <>
                {this.renderList()}
                {show && (
                    <Modal title='Редактирование' show={true} buttons={this.buttons} onClose={this.close}>
                        <div>{this.renderProps()}</div>
                    </Modal>
                )}
            </>
        );
    };
};