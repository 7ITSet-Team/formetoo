import fs from 'fs';

export default async (db, req, res, data) => {
    const isEdit = (data.changes && Object.keys(data.changes).includes('media'));
    const isCreate = (Object.keys(data).includes('media'));
    const refs = [];
    const upload = [];
    const productMedia = (isEdit ? data.changes : data).media;
    if (productMedia)
        for (const img of productMedia) {
            if (typeof img === 'object')
                refs.push(img._id);
            else {
                const image = await db.media.getByUrl(img);
                if (image)
                    refs.push(image._id);
                else
                    upload.push(img);
            }
        }
    if ((isEdit || isCreate) && upload.length) {
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