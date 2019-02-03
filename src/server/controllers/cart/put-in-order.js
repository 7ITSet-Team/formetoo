import jwt from 'jsonwebtoken';

import Config from '@project/config';

export default async (db, req, res, data) => {
    const {userByToken: user, productID, count} = data;

    let order = await db.order.getByUserOrOrderToken(user, req.cookies.orderJWT);
    if (!order) {
        order = await db.order.createNewOrder(user);
        const token = jwt.sign({id: order._id}, Config.jwt.secret);
        res.cookie('orderJWT', token, {maxAge: Config.jwt.lifetime, httpOnly: false});
    }

    const error = await order.putInOrder(productID, count);

    let result;
    if (!error)
        result = await order.cart();

    return {error, result};
};