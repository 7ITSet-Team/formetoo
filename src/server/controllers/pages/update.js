export default async (db, req, res, data) => {
    const isSuccess = await db.page.update(data);
    return {error: !isSuccess};
};