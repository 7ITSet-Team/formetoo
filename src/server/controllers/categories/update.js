import fs from 'fs';

export default async (db, req, res, data) => {
    let category = data;
    const isEdit = (data.changes && Object.keys(data.changes).includes('img') && data.changes.img.url);
    const isCreate = (Object.keys(data).includes('img') && data.img.url);
    if (isEdit || isCreate) {
        // thanks stackoverflow
        const matches = (isEdit ? data.changes : data).img.url.match(/^data:.+\/(.+);base64,(.*)$/);
        const imgData = matches[2];
        const buffer = new Buffer(imgData, 'base64');
        // I'm not sure that using synchronous functions is right way.
        fs.writeFileSync(`build/public/uploads/${(isEdit ? data.changes : data).img.name}`, buffer);
        const {isSuccess, _id} = await db.media.update({url: `/uploads/${(isEdit ? data.changes : data).img.name}`});
        if (!isSuccess) return {error: true};
        category = isEdit
            ? {...data, changes: {...data.changes, img: _id}}
            : {...data, img: _id};
    }
    const isSuccess = await db.category.update(category);
    return {error: !isSuccess};
};