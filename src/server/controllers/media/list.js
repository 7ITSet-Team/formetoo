export default async (db, req, res, data) => {
    const media = await db.media.getAll();
    const categories = await db.category.getAll();
    const {products} = await db.product.getAll();
    let result = [];
    media.forEach(img => {
        const imageCategories = [];
        const imageProducts = [];
        let categoryIsExist = false;
        let productIsExist = false;
        categories.forEach(category => {
            if (category.img === String(img._id)) {
                imageCategories.push({
                    name: category.name,
                    url: `/catalog/${category.slug}`
                });
                if (data.filter && data.filter.category && (category.name === data.filter.category))
                    categoryIsExist = true;
            }
        });
        products.forEach(product => {
            if (product.media.includes(String(img._id))) {
                imageProducts.push({
                    name: product.name,
                    url: `/catalog/product/${product.slug}`
                });
                if (data.filter && data.filter.product && (product.name === data.filter.product))
                    productIsExist = true;
            }
        });
        if ((categoryIsExist || productIsExist) || !data.filter)
            result.push({...(img.toJSON()), categories: imageCategories, products: imageProducts});
    });

    if (data.hash) {
        const mediaHash = {};
        media.forEach(img => (!Object.keys(mediaHash).includes(img._id) && (mediaHash[img._id] = img)));
        result = {
            media: result,
            mediaHash
        }
    }

    return {result};
};