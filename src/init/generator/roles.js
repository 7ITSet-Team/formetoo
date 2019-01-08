import routes from '../../src/server/core/routes';

const permissions = [];

Object.keys(routes).forEach(controllerName => {
    const controller = routes[controllerName];
    Object.keys(controller).forEach(actionName => {
        const action = controller[actionName];
        action.permission && permissions.push(action.permission);
    });
});

export default [
    {
        name: 'root',
        alias: 'Суперпользователь',
        permissions
    }
];