export default async (db, req, res, data) => {
    const result = await db.category.getAll();
    return {result};
};