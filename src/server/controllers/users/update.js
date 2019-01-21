export default async (db, req, res, data) => {
    const isSuccess = await db.user.update(data);
    return {error: !isSuccess};
};