export default async (db, req, res, data) => {
    const attributeSets = await db.attributeSet.getAll();
    return {result: attributeSets};
};