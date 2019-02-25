import Parser from '@server/core/csv-json-parser';

export default async (db, req, res, data) => {
    const {products} = await db.product.getAll(undefined, {_id: 0, __v: 0});
    products.forEach(product => product.props.forEach((prop, index, _props) => _props[index].attribute = _props[index].attribute._id));
    if (data.type === 'csv') {
        const parsedProducts = Parser.json2csv(products);
        return {error: false, result: parsedProducts};
    }
};