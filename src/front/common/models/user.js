import JSSHA from 'jssha';

import API from '@common/core/api';
import CartModel from '@models/cart';
import Message from '@components/ui/message';

export default class User {
    static get listeners() {
        this._listeners = this._listeners || new Set();
        return this._listeners;
    };

    static talk() {
        for (let listener of this.listeners) (typeof listener === 'function') && listener(this);
    };

    static async logout() {
        document.cookie = 'JWT=; path=/; expires=';
        document.cookie = 'orderJWT=; path=/; expires=';
        this.authorised = false;
        this.about = undefined;
        this.permissions = undefined;
        CartModel.clear();
        this.talk();
        Message.send('Совершен выход', Message.type.success);
    };

    static async login(logData) {
        const {error, data} = await API.request('auth', 'login', logData);
        if (error) {
            this.authorised = false;
            this.about = undefined;
            this.permissions = undefined;
            this.talk();
            Message.send(error, Message.type.danger);
            return false;
        }
        this.authorised = true;
        this.about = data.user;
        this.permissions = data.permissions;
        Message.send(`Добро пожаловать, ${this.about.name}`, Message.type.success);
        this.talk();
        return true;
    };

    static async check() {
        /*if (this.authorised)
            return;*/

        const {error, data} = await API.request('auth', 'check');
        if (error || !data.authorised) {
            this.authorised = false;
            this.about = undefined;
            this.permissions = undefined;
        } else {
            this.authorised = true;
            this.about = data.user;
            this.permissions = data.permissions;
        }
        this.talk();
    };

    static async registration(regData) {
        const {error, data} = await API.request('auth', 'registration', regData);
        if (error)
            Message.send(error, Message.type.danger);
        else
            Message.send('На указаный почтовый адрес выслано письмо для подтверждения аккаунта', Message.type.success);
        return !error;
    };

    static async verify(id) {
        const {error, data} = await API.request('auth', 'verify', {id});
        if (error)
            Message.send(error, Message.type.danger);
        else
            Message.send('Аккаунт успешно активирован', Message.type.success);
        return !error;
    };

    static getHash(email, password) {
        const shaObj = new JSSHA('SHA-512', 'TEXT');
        shaObj.update(email + password);
        return shaObj.getHash("HEX");
    };

    static async forgot(forData) {
        const {error, data} = await API.request('auth', 'forgot', forData);
        if (error)
            Message.send(error, Message.type.danger);
        else
            Message.send('На указаный при регистрации адрес Вам выслано письмо с инструкциями по восстановлению пароля', Message.type.success);
        return !error;
    };

    static async changePassword(password, id) {
        const {error, data} = await API.request('auth', 'change-password', {password, id});
        if (error)
            Message.send(error, Message.type.danger);
        else
            Message.send('Пароль успешно сменен', Message.type.success);
        return !error;
    };
};