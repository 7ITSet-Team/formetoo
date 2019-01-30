export default async (db, req, res, data) => {
    const isSuccess = await db.category.update(data);
    return {error: !isSuccess};
};