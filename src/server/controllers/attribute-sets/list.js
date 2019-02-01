export default async (db, req, res, data) => {
    const attributeSets = await db.attributeSet.getAll();
    const attributeIDs = [];
    attributeSets.forEach(attributeSet => {
        const attributes = attributeSet.attributes;
        attributes.forEach(attribute => (!attributeIDs.includes(attribute) && attributeIDs.push(attribute)));
    });
    const attributes = await db.attribute.getByID(attributeIDs);
    let attributesHash = {};
    attributes.forEach(attribute => attributesHash[attribute._id] = attribute);
    attributeSets.forEach(attributeSet => {
        const attributes = attributeSet.attributes;
        attributes.forEach((attribute, index, _attributes) => _attributes[index] = attributesHash[attribute]);
    });
    return {result: attributeSets};
};