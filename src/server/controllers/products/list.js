export default async (db, req, res, data) => {
    const result = await db.product.getAll(data);

    if (data.hash) {
        const productsHash = {};
        result.products.forEach(product => (productsHash[product._id] = product));
        result.productsHash = productsHash;
    }

    return {result};
};