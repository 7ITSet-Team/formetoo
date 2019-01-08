import nodemailer from 'nodemailer';

import Config from '@project/config';
import orderTemplate from '@server/templates/order';

export default async (db, req, res, data) => {
    const {userByToken: user} = data;

    const order = await db.order.getByUserOrOrderToken(user, req.cookies.orderJWT);
    if (!order)
        return;

    order.setStatus('ordered');

    const transporter = nodemailer.createTransport(Config.nodemailer);
    const mailOptions = {
        from: Config.contacts.support.mail,
        to: user.email,
        subject: 'Thanks for your order',
        html: orderTemplate()
    };
    transporter.sendMail(mailOptions, err => {
        if (err) throw err
    });

    return;
};