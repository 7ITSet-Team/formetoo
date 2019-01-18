import Routes from '@server/core/routes';

export default async (db, req, res, data) => {
    const permissions = Object.keys(Routes);
    permissions.splice(permissions.indexOf('guest'), 1);
    return {result: permissions};
};