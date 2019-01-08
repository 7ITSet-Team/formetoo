export default async (db, req, res, data) => {
    const result = {
        authorised: !!data.userByToken,
        permissions: [],
        user: {}
    };
    if (!result.authorised)
        return {result};

    result.permissions = await data.userByToken.getPermissions();
    result.user = {
        email: data.userByToken.email,
        phone: data.userByToken.phone,
        name: data.userByToken.name,
        lastname: data.userByToken.lastname
    };
    return {result};
};