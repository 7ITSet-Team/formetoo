export default async (db, req, res, data) => {
    const isSuccess = await db.product.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        const product = await db.product.getByID(data._id);
        return `<a href=` + `"http://localhost:8082/catalog/product/${product ? product.slug : undefined}"` + `>
            "` + product.name + `" product was changed.....
            here is some additional information...
        </a>`;
    } else {
        if (Object.keys(data).length > 1) {
            const product = await db.product.getBySlug(data.slug);
            return `<a href=` + `"http://localhost:8082/catalog/product/${product ? product.slug : undefined}"` + `>
                "` + product.name + `" product was created.....
                here is some additional information...
            </a>`;
        } else {
            // product was deleted
            return '<span>This product was deleted</span>';
        }
    }
};