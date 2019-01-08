import jwt from 'jsonwebtoken';

import Config from '@project/config';

export default async (db, req, res, data) => {
    const {id} = data;

    await db.user.activateById(id);
    const token = jwt.sign({id}, Config.jwt.secret);
    res.cookie('JWT', token, {maxAge: Config.jwt.lifetime, httpOnly: false});
    return;
};