import nodemailer from 'nodemailer';

import Config from '@project/config';
import orderTemplate from '@server/templates/order';

export default async (db, req, res, data) => {
    const {userByToken: user, deliveryAddress, comment, userInfo} = data;
    let order;
    if (userInfo) {
        const {error, newUser} = await db.user.update({...userInfo, password: 'qwerty', isActive: true});
        if (error)
            return;
        await db.order.setUserID(newUser, req.cookies.orderJWT);
        order = await db.order.getByUserOrOrderToken(newUser, req.cookies.orderJWT);
    } else
        order = await db.order.getByUserOrOrderToken(user, req.cookies.orderJWT);
    if (!order)
        return {error: true};
    order.setInfo({status: 'ordered', deliveryAddress, comment});

    const transporter = nodemailer.createTransport(Config.nodemailer);

    const email = (user && user.email) || userInfo.email;

    const mailOptions = {
        from: Config.contacts.support.mail,
        to: email,
        subject: 'Thanks for your order',
        html: orderTemplate()
    };
    transporter.sendMail(mailOptions, err => {
        if (err) throw err;
    });

    return {error: false};
};