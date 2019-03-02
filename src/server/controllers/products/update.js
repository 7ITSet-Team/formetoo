import fs from 'fs';
import decompress from 'decompress';
import mongoose from 'mongoose';

export default async (db, req, res, data) => {
    const isEdit = (data.changes && Object.keys(data.changes).includes('media'));
    const isCreate = (Object.keys(data).includes('media'));
    const refs = [];
    const upload = [];
    const productMedia = (isEdit ? data.changes : data).media;
    if (productMedia)
        for (const img of productMedia) {
            if (mongoose.Types.ObjectId.isValid(img)) {
                const image = await db.media.getByID(img);
                if (image)
                    refs.push(img);
                else
                    upload.push(img);
            } else
                upload.push(img);
        }
    if ((isEdit || isCreate) && upload.length) {
        const media = [];
        for (const img of upload) {
            const matches = img.match(/^data:[^\/]+\/([^;]+);base64,(.*)$/);
            const ext = matches[1];
            const imgData = matches[2];
            const buffer = new Buffer(imgData, 'base64');
            const date = new Date();
            const name = `${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
            const path = `build/public/uploads/${name}.${ext}`;
            fs.writeFileSync(path, buffer);
            if (ext === 'x-zip-compressed') {
                const outputPath = `build/public/uploads/${name}`;
                const files = await decompress(path, outputPath);
                const urls = [];
                for (const file of files)
                    urls.push(`/uploads/${name}/${file.path}`);
                media.push({url: urls});
                fs.unlinkSync(path);
            } else
                media.push({url: `/uploads/${name}.${ext}`});
        }
        const {isSuccess, ids} = await db.media.update(media);
        if (!isSuccess)
            return {error: true};
        (isEdit ? data.changes : data).media = [...refs, ...ids];
    } else if (!upload.length)
        (isEdit ? data.changes : data).media = refs;

    const isSuccess = await db.product.update(data);
    return {error: !isSuccess};
};

export const logView = async (data, db) => {
    if (data.changes) {
        const product = (await db.product.getByID(data._id)) || {};
        return `<a href=` + `"/catalog/product/${product.slug}">
                    "${product.name}" product was changed.....
                    here is some additional information...
                </a>`;
    } else {
        if (Object.keys(data).length > 1) {
            const product = (await db.product.getBySlug(data.slug)) || {};
            return `<a href=` + `"/catalog/product/${product.slug}">
                        "${product.name}" product was created.....
                        here is some additional information...
                    </a>`;
        } else {
            return '<span>This product was deleted</span>';
        }
    }
};