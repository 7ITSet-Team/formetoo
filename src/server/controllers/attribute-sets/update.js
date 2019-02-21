export default async (db, req, res, data) => {
    const isSuccess = await db.attributeSet.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        const set = (await db.attributeSet.getByID(data._id)) || {};
        return `<span>The "${set.name}" attribute set was changed.</span>`;
    } else {
        if (Object.keys(data).length > 1) {
            return `<span>The "${data.title}" attribute set was created.</span>`;
        } else {
            return '<span>The item was deleted</span>';
        }
    }
};