export default async (db, req, res, data) => {
    const result = await db.product.getAll();

    return {result};
};