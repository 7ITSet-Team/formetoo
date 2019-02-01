export default async (db, req, res, data) => {
    const products = await db.product.getAll();
    const attributeIDs = [];
    products.forEach(product => {
        const props = product.props;
        props.forEach(prop => (!attributeIDs.includes(prop.attribute) && attributeIDs.push(prop.attribute)));
    });
    const attributes = await db.attribute.getByID(attributeIDs);
    let attributesHash = {};
    attributes.forEach(attribute => attributesHash[attribute._id] = attribute);
    products.forEach(product => {
        const props = product.props;
        props.forEach((prop, index, _props) => _props[index].attribute = attributesHash[prop.attribute]);
    });
    return {result: products};
};