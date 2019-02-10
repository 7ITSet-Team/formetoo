export default async (db, req, res, data) => {
    const isSuccess = await db.log.deleteAll();
	return {error: !isSuccess};
};