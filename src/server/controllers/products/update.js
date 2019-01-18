export default async (db, req, res, data) => {
    const isSuccess = await db.product.update(data);
    return {error: !isSuccess};
};