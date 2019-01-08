import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Config from '@project/config';

export default async (db, req, res, data) => {
    const {email, password} = data;
    const user = await db.user.getByEmail(email);
    const incorrectAnswer = {result: undefined, error: 'incorrect login-password pair'};
    if (!user)
        return incorrectAnswer;

    if (!user.isActive)
        return {result: undefined, error: 'need to activate account'};

    const isChecked = await bcrypt.compare(password, user.password);

    if (isChecked) {
        const permissions = await user.getPermissions();
        const token = jwt.sign({id: user._id}, Config.jwt.secret);
        res.cookie('JWT', token, {maxAge: Config.jwt.lifetime, httpOnly: false});
        return {
            result: {
                permissions,
                user: {
                    email: user.email,
                    phone: user.phone,
                    name: user.name,
                    lastname: user.lastname
                }
            }
        };
    } else {
        return incorrectAnswer;
    }
};