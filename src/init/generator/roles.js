import routes from '../../server/core/routes';

const rootPermissions = Object.keys(routes);
rootPermissions.splice(rootPermissions.indexOf('guest'), 1);

export default [
    /*{
        name: 'root',
        alias: 'Суперпользователь',
        permissions: rootPermissions
    },*/
    {
        name: 'client',
        alias: 'Клиент',
        permissions: ['client']
    }, {
        name: 'banned',
        alias: 'Заблокированный пользователь',
        permissions: ['banned']
    }
];