export default async (db, req, res, data) => {
    await db.role.update(data);
    return;
};