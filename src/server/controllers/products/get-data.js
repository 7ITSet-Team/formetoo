export default async (db, req, res, data) => {
    const {error} = await db.product.getData(data);
    return {error};
};