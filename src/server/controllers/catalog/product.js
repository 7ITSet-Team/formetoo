export default async (db, req, res, data) => {
    const {slug} = data;
    const product = await db.product.getBySlug(slug);
    return {result: product};
};