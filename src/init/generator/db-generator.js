import pages from './pages';
import categories from './categories';
import products from './products';
import roles from './roles';
import attributes from './attributes';
import attributeSets from './attribute-sets';

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
        await DBGenerator.setData('attributeSet', attributeSets, async (item, collection) => {
            const attribute = await this.db.attribute.findOne();
            item.name = 'setName';
            item.title = 'setTitle';
            item.attributes = [attribute._id];
            await new collection(item).save();
        });
        let artCounter = 0;
        await DBGenerator.setData('product', products, async (item, collection) => {
            const category = await this.db.category.findOne();
            const attribute = await this.db.attribute.findOne();
            item.categoryID = category._id;
            const prop = {attribute: attribute._id, value: 'some value'};
            item.props = [prop];
            item.code = 'ART' + ++artCounter;
            item.name = 'Продукт ' + artCounter;
            item.slug = 'product' + artCounter;
            item.price = 1000 * artCounter;
            const img = '/uploads/on5fbrxucpmhtzkklqtm.jpg';
            item.media = [img, img, img];
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