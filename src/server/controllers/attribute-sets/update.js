export default async (db, req, res, data) => {
    const isSuccess = await db.attributeSet.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        return `<span>This item was changed.</span>`;
    } else {
        if (Object.keys(data).length > 1) {
            return `<span>"` + data.title + `" set was created.</span>`;
        } else {
            return '<span>The item was deleted</span>';
        }
    }
};