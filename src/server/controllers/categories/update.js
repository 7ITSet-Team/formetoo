import fs from 'fs';
import mongoose from 'mongoose';

export default async (db, req, res, data) => {
    let category = data;

    const isEdit = (data.changes && Object.keys(data.changes).includes('img'));
    const isCreate = (Object.keys(data).includes('img'));
    // ObjectId.isValid returns false if argument is not objectId type
    const mediaIsUpload = !mongoose.Types.ObjectId.isValid((isEdit ? data.changes : data).img) && ((isEdit ? data.changes : data).img !== '');
    if ((isEdit || isCreate) && mediaIsUpload) {
        // thanks stackoverflow
        const matches = (isEdit ? data.changes : data).img.match(/^data:.+\/(.+);base64,(.*)$/);
        const imgData = matches[2];
        const ext = matches[1];
        const buffer = new Buffer(imgData, 'base64');
        const date = new Date();
        const name = `${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
        // I'm not sure that using synchronous functions like this one is a right way.
        fs.writeFileSync(`build/public/uploads/${name}.${ext}`, buffer);
        //
        const {isSuccess, _id} = await db.media.update({url: `/uploads/${name}.${ext}`});
        if (!isSuccess)
            return {error: true};
        category = isEdit
            ? {...data, changes: {...data.changes, img: _id}}
            : {...data, img: _id};
    }

    const isSuccess = await db.category.update(category);
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