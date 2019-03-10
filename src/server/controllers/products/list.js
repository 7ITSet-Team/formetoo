export default async (db, req, res, data) => {
    const products = await db.product.getAll(data);
    let result;
    if (data.page)
        result = products;
    else
        result = {products};

    if (data.hash) {
        const productsHash = {};
        for (const product of products) {
            productsHash[product._id] = product
        }
        result.productsHash = productsHash;
    }

    return {result};
};