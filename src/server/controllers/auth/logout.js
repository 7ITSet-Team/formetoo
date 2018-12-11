export default async (db, req, res, data) => {
    res.clearCookie('JWT');
    return;
};