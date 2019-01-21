export default async (db, req, res, data) => {
    const result = await db.user.getAll();
    return {result};
};