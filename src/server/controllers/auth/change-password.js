import bcrypt from 'bcryptjs';

export default async (db, req, res, data) => {
    let {id, password} = data;
    let user = data.userByToken;
    if (!user && id)
        user = await db.user.getByID(id);
    if (!user)
        return;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.save();

    return;
};