export default async (db, req, res, data) => {
    const result = await db.setting.getAll();
    return {result};
};