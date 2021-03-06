import pages from './pages';
import categories from './categories';
import products from './products';
import roles from './roles';
import attributes from './attributes';
import attributeSets from './attributeSets';
import settings from './settings';

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
        await DBGenerator.setData('attribute', attributes, async (item, collection) => await new collection(item).save());
        await DBGenerator.setData('setting', settings, async (item, collection) => await new collection(item).save());
        let artCounter = 0;
        await DBGenerator.setData('product', products, async (item, collection) => {
            const category = await this.db.category.findOne();
            item.categoryID = category._id;
            item.code = 'ART' + ++artCounter;
            item.name = 'Продукт ' + artCounter;
            item.slug = 'product' + artCounter;
            item.price = 1000 * artCounter;
            item.description = 'some description';
            item.shortDescription = 'some short description';
            await new collection(item).save()
        });
        await DBGenerator.setData('role', roles, async (item, collection) => await new collection(item).save());
        await DBGenerator.setData('attributeSet', attributeSets, async (item, collection) => {
            item.name = 'all';
            item.title = 'all';
            item.attributes = [];
            const attributes = await this.db.attribute.find();
            attributes.forEach(({_id}) => item.attributes.push(_id));
            await new collection(item).save()
        });
    };

    static async setData(collectionName, dataList, handler) {
        if (await this.db[collectionName].countDocuments() > 0)
            return;
        dataList.forEach(async item => await handler(item, this.db[collectionName]));
    };
};