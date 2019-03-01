export default async (db, req, res, data) => {
    const attributes = await db.attribute.getAll();

    let result = attributes;
    if (data.hash) {
        const attributesHash = {};
        attributes.forEach(attribute => (attributesHash[attribute._id] = attribute));
        result = {
            attributes,
            attributesHash
        };
    }

    return {result};
};