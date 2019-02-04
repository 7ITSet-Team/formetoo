export default async (db, req, res, data) => {
    const products = await db.product.getAll();
    return {result: products};
};