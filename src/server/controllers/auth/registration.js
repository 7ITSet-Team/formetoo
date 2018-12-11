import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import Config from '@project/config';
import registrationTemplate from '@server/templates/registration';

export default async (db, req, res, data) => {
    const {password, phone, email, name, lastname} = data;
    const user = await db.user.getByEmail(email);
    if (user)
        return {result: undefined, error: 'this email address is busy'};

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new db.user({
        email,
        phone,
        password: hashedPassword,
        name,
        lastname,
        visibility: ['shop'],
        isActive: false
    }).save();

    const transporter = nodemailer.createTransport(Config.nodemailer);
    const baseURL = req.protocol + '://' + req.host;
    const link = `${baseURL}/account/verify/${newUser._id}`;
    const mailOptions = {
        from: Config.contacts.support.mail,
        to: email,
        subject: 'Account activation',
        html: registrationTemplate({link})
    };
    transporter.sendMail(mailOptions, err => {
        if (err) throw err
    });

    return;
};