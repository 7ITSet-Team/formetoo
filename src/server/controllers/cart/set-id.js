export default async (db, req, res, data) => {
    const result = await db.order.setUserID(data.userByToken, req.cookies.orderJWT);
    return {error: result};
};