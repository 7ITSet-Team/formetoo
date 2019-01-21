export default async (db, req, res, data) => {
    const isSuccess = await db.tab.update(data);
    return {error: !isSuccess};
};