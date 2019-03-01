export default async (db, req, res, data) => {
    const media = await db.media.getAll();
    let result = [];
    for (const img of media) {
        const imageCategories = await img.getCategories();
        const imageProducts = await img.getProducts();
        let needToPush = true;
        if (data.filter) {
            if (data.filter.category) {
                const isCatExist = imageCategories.some(category => category.name === data.filter.category);
                if (!isCatExist)
                    needToPush = false;
            }
            if (needToPush && data.filter.product) {
                const isProdExist = imageProducts.some(product => product.name === data.filter.product);
                if (!isProdExist)
                    needToPush = false;
            }
        }
        if (needToPush)
            result.push({
                ...(img.toJSON()),
                categories: imageCategories,
                products: imageProducts
            });
    }
    return {result};
};