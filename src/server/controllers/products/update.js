import mongoose from "mongoose";
import fs from 'fs';

export default async (db, req, res, data) => {
    const isEdit = (data.changes && Object.keys(data.changes).includes('media'));
    const isCreate = (Object.keys(data).includes('media'));
    const refs = [];
    const upload = [];
    const productMedia = (isEdit ? data.changes : data).media;
    productMedia && productMedia.forEach(img => {
        if (mongoose.Types.ObjectId.isValid(img)) refs.push(img);
        else upload.push(img);
    });
    let product = data;
    if ((isEdit || isCreate) && (upload.length > 0)) {
        const media = [];
        upload.forEach(img => {
            const matches = img.match(/^data:.+\/(.+);base64,(.*)$/);
            const imgData = matches[2];
            const ext = matches[1];
            const buffer = new Buffer(imgData, 'base64');
            const date = new Date();
            const name = `${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
            fs.writeFileSync(`build/public/uploads/${name}.${ext}`, buffer);
            media.push({url: `/uploads/${name}.${ext}`});
        });
        const {isSuccess, ids} = await db.media.update(media);
        if (!isSuccess) return {error: true};
        product = isEdit
            ? {...data, changes: {...data.changes, media: [...refs, ...ids]}}
            : {...data, media: [...refs, ...ids]};
    }
    const isSuccess = await db.product.update(product);
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