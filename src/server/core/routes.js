import categories from '@server/controllers/catalog/categories';
import category from '@server/controllers/catalog/category';
import product from '@server/controllers/catalog/product';
import page from '@server/controllers/content/page';
import mainMenu from '@server/controllers/content/main-menu';
import login from '@server/controllers/auth/login';
import logout from '@server/controllers/auth/logout';
import registration from '@server/controllers/auth/registration';
import verify from '@server/controllers/auth/verify';
import cartInfo from '@server/controllers/cart/info';
import order from '@server/controllers/cart/order';

export default {
    catalog: {
        'categories': {handler: categories, visibility: ['quest']},
        'category': {handler: category, visibility: ['quest']},
        'product': {handler: product, visibility: ['quest']}
    },
    cart:{
        'info': {handler: cartInfo, visibility: ['quest']},
        'order':{handler: order, visibility: ['shop']}
    },
    content: {
        'page': {handler: page, visibility: ['quest']},
        'main-menu': {handler: mainMenu, visibility: ['quest']}
    },
    auth: {
        'login': {handler: login, visibility: ['quest']},
        'logout': {handler: logout, visibility: ['quest']},
        'registration': {handler: registration, visibility: ['quest']},
        'verify': {handler: verify, visibility: ['quest']}//permission=''
    }
};