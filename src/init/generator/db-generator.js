import pages from './pages';
import categories from './categories';
import products from './products';
import roles from './roles';

export default class DBGenerator {
    static init(db) {
        this.db = db;
        DBGenerator.generate();
    };

    static async generate() {
        let sort = 0;
        await DBGenerator.setData('page', pages, async (item, collection) => await new collection({
            ...item,
            position: ++sort
        }).save());
        await DBGenerator.setData('category', categories, async (item, collection) => await new collection(item).save());
        let artCounter = 0;
        await DBGenerator.setData('product', products, async (item, collection) => {
            const category = await this.db.category.findOne();
            item.categoryID = category._id;
            item.code = 'ART' + ++artCounter;
            item.name = 'Продукт ' + artCounter;
            item.slug = 'product' + artCounter;
            item.price = 1000 * artCounter;
            const img = '/uploads/on5fbrxucpmhtzkklqtm.jpg';
            item.media = [img, img, img];
            item.props = [
                {name: 'Производитель', value: 'Китай'},
                {name: 'Любой параметр', value: 'Любое значение'},
                {name: 'Любой параметр2', value: 'Любое значение2'},
                {name: 'Любой параметр3', value: 'Любое значение3'},
                {name: 'Любой параметр4', value: 'Любое значение4'},
                {name: 'Любой параметр5', value: 'Любое значение5'}
            ]
            await new collection(item).save()
        });
        await DBGenerator.setData('role', roles, async (item, collection) => await new collection(item).save());
    };

    static async setData(collectionName, dataList, handler) {
        if (await this.db[collectionName].countDocuments() > 0)
            return;
        dataList.forEach(async item => await handler(item, this.db[collectionName]));
    };
};