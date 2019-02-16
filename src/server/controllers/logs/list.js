export default async (db, req, res, data) => {
    const result = await db.log.getAll(data);
	return {result};
};