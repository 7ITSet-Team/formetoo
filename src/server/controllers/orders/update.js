export default async (db, req, res, data) => {
    const isSuccess = await db.order.update(data);
    return {error: !isSuccess};
};