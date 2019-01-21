export default async (db, req, res, data) => {
    const isSuccess = await db.attribute.update(data);
    return {error: !isSuccess};
};