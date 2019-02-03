export default async (db, req, res, data) => {
    const {error, newUser} = await db.user.update(data);
    return {error, newUser};
};