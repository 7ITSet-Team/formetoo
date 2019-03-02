import fs from 'fs';

export default async (db, req, res, data) => {
    if (data.changes) {
        const matches = data.changes.url.match(/^data:[^\/]+\/([^;]+);base64,(.*)$/);
        const imgData = matches[2];
        const ext = matches[1];
        const buffer = new Buffer(imgData, 'base64');
        const date = new Date();
        const name = `${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
        fs.writeFileSync(`build/public/uploads/${name}.${ext}`, buffer);
        data.changes = {url: `/uploads/${name}.${ext}`};
    }
    const {isSuccess} = await db.media.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        const media = await db.media.getByID(data._id);
        return `<span>The <a href="${media.url}">image</a> was changed.</span>`;
    } else {
        if (Object.keys(data).length > 1) {
            return `<span>The <a href="${data.url}">image</a> was created.</span>`;
        } else
            return '<span>This item was deleted</span>';
    }
};