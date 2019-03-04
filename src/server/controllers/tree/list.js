export default async (db, req, res, data) => {
    const categories = await db.category.getAll();
    const products = await db.product.getAll();

    const productHash = {};
    for (const product of products)
        if (productHash[product.categoryID])
            productHash[product.categoryID] = [...productHash[product.categoryID], product];
        else
            productHash[product.categoryID] = [product];

    const result = [];
    for (const category of categories)
        result.push({
            ...(category.toJSON()),
            products: productHash[category._id]
        });
    return {result};
};