export default async (db, req, res, data) => {
    const isSuccess = await db.attributeSet.update(data);
    return {error: !isSuccess};
};