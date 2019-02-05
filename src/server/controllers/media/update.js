export default async (db, req, res, data) => {
    const {isSuccess} = await db.media.update(data);
    return {error: !isSuccess};
};