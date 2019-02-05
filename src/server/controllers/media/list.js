export default async (db, req, res, data) => {
    const result = await db.media.getAll();
    return {result};
};