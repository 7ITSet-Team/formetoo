export default async (db, req, res, data) => {
    const attributeSets = await db.attributeSet.getAll();
    const attributeIDs = [];
    for (let i = 0; i < attributeSets.length; i++) {
        const attributeSet = attributeSets[i];
        const attributes = attributeSet.attributes;
        for (let j = 0; j < attributes.length; j++) {
            if (!attributeIDs.includes(attributes[j]))
                attributeIDs.push(attributes[j])
        }
    }
    const attributes = await db.attribute.getByID(attributeIDs);
    let attributesHash = {};
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        attributesHash[attribute._id] = attribute;
    }
    for (let i = 0; i < attributeSets.length; i++) {
        const attributeSet = attributeSets[i];
        const attributes = attributeSet.attributes;
        for (let j = 0; j < attributes.length; j++) {
            attributes[j] = attributesHash[attributes[j]];
        }
    }
    return {result: attributeSets};
};