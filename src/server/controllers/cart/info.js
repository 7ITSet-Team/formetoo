export default async (db, req, res, data) => {
    const order = await db.order.getByUserOrOrderToken(data.userByToken, req.cookies.orderJWT);
    if (!order)
        return;

    const result = await order.cart();
    return {result};
};