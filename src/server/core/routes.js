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
import placingOrders from '@server/controllers/cart/placing-orders';
import putInOrder from '@server/controllers/cart/put-in-order';
import rolesList from '@server/controllers/roles/list';
import rolesUpdate from '@server/controllers/roles/update';
import permissionsList from '@server/controllers/permissions/list';
import productsList from '@server/controllers/products/list';
import productsUpdate from '@server/controllers/products/update';
import productsUpload from '@server/controllers/products/upload';

export default {
    guest:{
        catalog: {
            'categories': categories,
            'category': category,
            'product': product
        },
        cart:{
            'info': cartInfo,
            'put-in-order':putInOrder
        },
        content: {
            'page': page,
            'main-menu':mainMenu
        },
        auth: {
            'login': login,
            'logout': logout,
            'registration': registration,
            'verify': verify,
            'check':check,
            'forgot':forgot,
            'change-password':changePassword
        }
    },
    client:{
        cart:{
            'placing-orders':placingOrders
        }
    },
    media:{

    },
    tabs:{

    },
    attributes:{

    },
    orders:{

    },
    users:{

    },
    roles:{
        roles: {
            'list': rolesList,
            'update': rolesUpdate
        },
        permissions: {
            'list': permissionsList
        }
    },
    categories:{

    },
    products:{
        products: {
            'list': productsList,
            'update': productsUpdate,
            'upload-data': productsUpload
        }
    },
    pages:{

    },
    settings:{

    },
    logs:{

    }
};