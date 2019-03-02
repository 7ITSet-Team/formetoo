import fs from 'fs';

export default async (db, req, res, data) => {
    const isEdit = (data.changes && Object.keys(data.changes).includes('img'));
    const isCreate = (Object.keys(data).includes('img'));

    const image = await db.media.getByUrl((isEdit ? data.changes : data).img);
    const mediaIsUpload = !image;

    if ((isEdit || isCreate) && mediaIsUpload && ((isEdit ? data.changes : data).img !== '')) {
        const matches = (isEdit ? data.changes : data).img.match(/^data:[^\/]+\/([^;]+);base64,(.*)$/);
        const imgData = matches[2];
        const ext = matches[1];
        const buffer = new Buffer(imgData, 'base64');
        const date = new Date();
        const name = `${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
        fs.writeFileSync(`build/public/uploads/${name}.${ext}`, buffer);

        const {isSuccess, _id} = await db.media.update({url: `/uploads/${name}.${ext}`});
        if (!isSuccess)
            return {error: true};

        (isEdit ? data.changes : data).img = _id;
    } else if (!mediaIsUpload)
        (isEdit ? data.changes : data).img = image._id;

    const isSuccess = await db.category.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        const category = (await db.category.getByID(data._id)) || {};
        return `<span>The "${category.name}" category was changed.</span>`;
    } else {
        if (Object.keys(data).length > 1) {
            return `<span>"${data.name}" category was created.</span>`;
        } else {
            return '<span>This item was deleted</span>';
        }
    }
};