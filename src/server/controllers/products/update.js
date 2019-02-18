export default async (db, req, res, data) => {
    const isSuccess = await db.product.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        const product = await db.product.getByID(data._id);
        if (product)
            return `<a href=` + `"/catalog/product/${product.slug}"` + `>
                "` + product.name + `" product was changed.....
                here is some additional information...
            </a>`;
    } else {
        if (Object.keys(data).length > 1) {
            const product = await db.product.getBySlug(data.slug);
            if (product)
                return `<a href=` + `"/catalog/product/${product.slug}"` + `>
                "` + product.name + `" product was changed.....
                here is some additional information...
            </a>`;
        } else {
            return '<span>This product was deleted</span>';
        }
    }
};