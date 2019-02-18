export default async (db, req, res, data) => {
    const media = await db.media.getAll();
    const categories = await db.category.getAll();
    const result = [];
    media.forEach(img => {
        const imageCategories = [];
        categories.forEach(category => ((category.img === String(img._id)) && imageCategories.push({
            name: category.name,
            url: `/catalog/${category.slug}`
        })));
        result.push({...(img.toJSON()), categories: imageCategories});
    });
    return {result};
};