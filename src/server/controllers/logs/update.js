export default async (db, req, res, data) => {
	const isSuccess = await db.log.delete(data);
	return {error: !isSuccess};
};