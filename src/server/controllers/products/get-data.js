export default async (db, req, res, data) => {
    const {error, parsedProducts} = await db.product.getData(data);
    return {error, result: parsedProducts};
};