export default async (db, req, res, data) => {
    const {products, pages} = await db.product.getAll(data);

    let result = {products, pages};

    if (data.hash) {
        const productsHash = {};
        products.forEach(product => (productsHash[product._id] = product));
        result = {
            products,
            productsHash
        }
    }

    return {result};
};