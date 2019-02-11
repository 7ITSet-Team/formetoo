export default async (db, req, res, data) => {
    const user = {...data.userByToken.toJSON()};
    delete user.password;
    const ordersData = await db.order.getByUser(user);
    if (ordersData) {
        const productsIDs = [];
        ordersData.products.forEach(product => (!productsIDs.includes(product._id)) && productsIDs.push(product._id));
        const products = await db.product.getByID(productsIDs);
        if (products) {
            const productsHash = {};
            products.forEach(product => productsHash[product._id] = product);
            user.orders = [{
                ...ordersData.toJSON(),
                products: ordersData.products.map(product => ({
                    count: product.count,
                    product: productsHash[product._id]
                }))
            }];
        }
    }
    return {error: false, result: user};
}