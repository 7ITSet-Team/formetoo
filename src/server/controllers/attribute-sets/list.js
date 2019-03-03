export default async (db, req, res, data) => {
    const attributeSets = await db.attributeSet.getAll();
    return {result: attributeSets.map(set => ({...(set.toJSON()), attributes: set.attributes.map(({_id}) => _id)}))};
};