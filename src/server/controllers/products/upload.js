export default async (db, req, res, data) => {
    const result = await db.product.upload(data);
    return {error: result.error, result: result.errorRows};
};