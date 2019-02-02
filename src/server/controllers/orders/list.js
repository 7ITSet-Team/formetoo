export default async (db, req, res, data) => {
    const result = await db.order.getAll();
    return {result};
};