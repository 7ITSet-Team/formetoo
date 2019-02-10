export default async (db, req, res, data) => {
    const isSuccess = await db.setting.update(data);
    return {error: !isSuccess};
};