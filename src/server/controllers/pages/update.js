export default async (db, req, res, data) => {
    const isSuccess = await db.page.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        const page = (await db.page.getByID(data._id)) || {};
        return `<span>The "${page.title}" page was changed.</span>`;
    } else {
        if (Object.keys(data).length > 1) {
            return `<span>The "${data.title}" page was created.</span>`;
        } else {
            return '<span>This item was deleted</span>';
        }
    }
};