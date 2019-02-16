export default async (db, req, res, data) => {
    const isSuccess = await db.log.update(data);
    return {error: !isSuccess};
};