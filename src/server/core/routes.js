import categories from '@server/controllers/catalog/categories';
import category from '@server/controllers/catalog/category';
import product from '@server/controllers/catalog/product';
import page from '@server/controllers/content/page';
import mainMenu from '@server/controllers/content/main-menu';
import login from '@server/controllers/auth/login';
import logout from '@server/controllers/auth/logout';
import registration from '@server/controllers/auth/registration';
import verify from '@server/controllers/auth/verify';
import check from '@server/controllers/auth/check';
import forgot from '@server/controllers/auth/forgot';
import changePassword from '@server/controllers/auth/change-password';
import cartInfo from '@server/controllers/cart/info';
import cartSetID from '@server/controllers/cart/set-id';
import placingOrders from '@server/controllers/cart/placing-orders';
import putInOrder from '@server/controllers/cart/put-in-order';
import rolesList from '@server/controllers/roles/list';
import rolesUpdate from '@server/controllers/roles/update';
import permissionsList from '@server/controllers/permissions/list';
import productsList from '@server/controllers/products/list';
import productsUpdate from '@server/controllers/products/update';
import productsUpload from '@server/controllers/products/upload';
import productsExport from '@server/controllers/products/export';
import pagesList from '@server/controllers/pages/list';
import pagesUpdate from '@server/controllers/pages/update';
import usersList from '@server/controllers/users/list';
import usersUpdate from '@server/controllers/users/update';
import attributesList from '@server/controllers/attributes/list';
import attributesUpdate from '@server/controllers/attributes/update';
import attributeSetsList from '@server/controllers/attribute-sets/list';
import attributeSetsUpdate from '@server/controllers/attribute-sets/update';
import categoriesList from '@server/controllers/categories/list';
import categoriesUpdate from '@server/controllers/categories/update';
import ordersList from '@server/controllers/orders/list';
import ordersUpdate from '@server/controllers/orders/update';
import mediaList from '@server/controllers/media/list';
import mediaUpdate from '@server/controllers/media/update';
import logsList from '@server/controllers/logs/list';
import logsDelete from '@server/controllers/logs/delete';

export default {
    guest: {
        catalog: {
            'categories': categories,
            'category': category,
            'product': product
        },
        cart: {
            'info': cartInfo,
            'placing-orders': placingOrders,
            'put-in-order': putInOrder
        },
        content: {
            'page': page,
            'main-menu': mainMenu
        },
        auth: {
            'login': login,
            'logout': logout,
            'registration': registration,
            'verify': verify,
            'check': check,
            'forgot': forgot,
            'change-password': changePassword
        }
    },
    client: {
        cart: {
            'placing-orders': placingOrders,
            'set-id': cartSetID
        }
    },
    media: {
        media: {
            'list': mediaList,
            'update': mediaUpdate
        }
    },
    attributes: {
        attributes: {
            'list': attributesList,
            'update': attributesUpdate
        }
    },
    'attribute-sets': {
        'attribute-sets': {
            'list': attributeSetsList,
            'update': attributeSetsUpdate
        }
    },
    orders: {
        orders: {
            'list': ordersList,
            'update': ordersUpdate
        }
    },
    users: {
        users: {
            'list': usersList,
            'update': usersUpdate
        }
    },
    roles: {
        roles: {
            'list': rolesList,
            'update': rolesUpdate
        },
        permissions: {
            'list': permissionsList
        }
    },
    categories: {
        categories: {
            'list': categoriesList,
            'update': categoriesUpdate
        }
    },
    products: {
        products: {
            'list': productsList,
            'update': productsUpdate,
            'upload-data': productsUpload,
            'export': productsExport
        }
    },
    pages: {
        pages: {
            'list': pagesList,
            'update': pagesUpdate
        }
    },
    settings: {},
    logs: {
        logs: {
            'list': logsList,
            'delete-all': logsDelete
        }
    }
};