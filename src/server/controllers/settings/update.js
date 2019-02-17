export default async (db, req, res, data) => {
    const isSuccess = await db.setting.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        return `<span>This item was changed.</span>`;
    } else {
        return '<span>This item was deleted</span>';
    }
};