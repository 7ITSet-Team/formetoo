export default async (db, req, res, data) => {
    const result = await db.role.getAll();
    return {result};
};