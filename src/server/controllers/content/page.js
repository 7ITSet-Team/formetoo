export default async (db, req, res, data) => {
    const {slug} = data;
    const result = await db.page.getBySlug(slug);
    return {result};
};