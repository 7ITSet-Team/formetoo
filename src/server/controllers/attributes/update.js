export default async (db, req, res, data) => {
    const isSuccess = await db.attribute.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        return `<span>This item was changed.</span>`;
    } else {
        if (Object.keys(data).length > 1) {
            return `<span>"` + data.title + `" attribute was created.</span>`;
        } else {
            return '<span>This item was deleted</span>';
        }
    }
};