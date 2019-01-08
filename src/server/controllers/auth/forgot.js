import nodemailer from 'nodemailer';

import Config from '@project/config';
import recoveryTemplate from '@server/templates/recovery';

export default async (db, req, res, data) => {
    let {type, identificator} = data;
    let user = undefined;
    if (type === 'email') {
        identificator = identificator.toLowerCase();
        user = await db.user.getByEmail(identificator);
    } else if (type === 'phone') {
        user = await db.user.getByPhone(identificator);
    }
    if (!user)
        return;

    const transporter = nodemailer.createTransport(Config.nodemailer);
    const baseURL = req.protocol + '://' + req.hostname;
    const link = `${baseURL}/account/recovery/${user.email}/${user._id}`;
    const mailOptions = {
        from: Config.contacts.support.mail,
        to: user.email,
        subject: 'Account recovery',
        html: recoveryTemplate({link})
    };
    transporter.sendMail(mailOptions, err => {
        if (err) throw err
    });

    return;
};