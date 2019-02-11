import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import JSSHA from 'jssha';

import DBGenerator from './generator/db-generator.js'
import Config from '../config.js';
import * as models from '../server/db/index.js';

(async () => {
    mongoose.connect(Config.db.url, {autoIndex: false});
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    mongoose.connection.once('open', console.error.bind(console, 'connected to db'));

    const db = {};
    Object.keys(models).forEach(modelName => models[modelName](db));

    DBGenerator.init(db);

    const newUserData = {
        password: '!ololo#2018FMT$',
        phone: '123456',
        email: 'shadowasp2@yandex.ru',
        name: 'Max',
        lastname: 'Yashkov'
    };

    const user = await db.user.getByEmail(newUserData.email);
    if (user)
        console.log('этот email уже занят');

    const shaObj = new JSSHA('SHA-512', 'TEXT');
    shaObj.update(newUserData.email + newUserData.password);
    newUserData.password = shaObj.getHash("HEX");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUserData.password, salt);

    const newUser = new db.user({
        email: newUserData.email,
        phone: newUserData.phone,
        password: hashedPassword,
        name: newUserData.name,
        lastname: newUserData.lastname,
        role:'root',
        isActive: true
    }).save();

    console.log('=========THE END=========')
})();