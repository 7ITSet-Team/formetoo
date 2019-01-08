import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

import Config from '@project/config';
import registrationTemplate from '@server/templates/registration';

export default async (db, req, res, data) => {
    let {password, phone, email, name, lastname} = data;
    email=email.toLowerCase();
    const user = await db.user.getByEmail(email);
    if (user)
        return {result: undefined, error: 'этот email уже занят'};

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await new db.user({
        email,
        phone,
        password: hashedPassword,
        name,
        lastname,
        role: 'client',
        isActive: false
    }).save();

    if(req.cookies.orderJWT){
        await db.order.setLinkOnUser(req.cookies.orderJWT,newUser);
    }

    const transporter = nodemailer.createTransport(Config.nodemailer);
    const baseURL = req.protocol + '://' + req.hostname;
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