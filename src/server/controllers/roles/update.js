export default async (db, req, res, data) => {
    const isSuccess = await db.role.update(data);
    return {error: !isSuccess};
};