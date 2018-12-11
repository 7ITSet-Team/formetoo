export default async (db, req, res, data) => {
    const {slug} = data;
    const category = await db.category.getBySlug(slug);
    const products = await category.getProducts();
    return {result:products};
};