export default class Parser {
    static csv2json(data) {
        const parsed = [];
        const content = data.substring(0, data.length - 2); // удаляем завершающий \n
        const rows = content.split('\n');
        const columnsTitles = rows[0].split(';'); // первая строка - заголовки столбцов
        for (let i = 1; i <= rows.length - 1; i++) {
            const row = rows[i];
            const rowElements = row.split(';');
            const parsedItem = {};
            for (let j = 0; j < rowElements.length; j++) {
                parsedItem[columnsTitles[j]] = rowElements[j];
            }
            parsed.push(parsedItem);
        }
        return parsed;
    };

    static json2csv(data) {
        /*

        ШАБЛОН ВЫХОДНОЙ СТРОКИ:
        <ЗАГОЛОВОК СТОЛБЦА>;<ЗАГОЛОВОК СТОЛБЦА>;<ЗАГОЛОВОК СТОЛБЦА>;<ЗАГОЛОВОК СТОЛБЦА>
        <ЗНАЧЕНИЕ>;         <ЗНАЧЕНИЕ>;         <ЗНАЧЕНИЕ>;         <ЗНАЧЕНИЕ>;
        ...                 ...                 ...                 ...

        ЕСЛИ ЗНАЧЕНИЕ - МАССИВ, ТО ЭЛЕМЕНТЫ МАССИВА РАЗДЕЛЯЮТСЯ МЕЖДУ СОБОЙ ЗАПЯТЫМИ.

        ЕСЛИ ЗНАЧЕНИЕ - ПОЛЕ prop, ТО ЗАПИСЬ ИМЕЕТ СЛЕДУЮЩИЙ ВИД:
        производитель:Китай,Любой параметр:Любое значение,Любой параметр2:Любое значение2;

         */
        const columnsTitles = Object.keys(data[0].toJSON());

        let text = '';
        for (let columnIndex = 0; columnIndex < columnsTitles.length; columnIndex++) {
            /*

            ЗАГОЛОВКИ СТОЛБЦА РАЗДЕЛЯЕМ ";" МЕЖДУ СОБОЙ, ЕСЛИ ЗАГОЛОВОК ПОСЛЕДНИЙ - ПЕРЕНОСИМ СТРОКУ

             */
            const title = columnsTitles[columnIndex];
            text = `${text}${title}${columnIndex === columnsTitles.length - 1 ? '\n' : ';'}`
        }

        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < columnsTitles.length; j++) {
                const product = data[i];
                const prop = columnsTitles[j];
                if (prop === 'media')
                    /*

                    ЕСЛИ КАРТИНКИ - РАЗДЕЛЯЕМ ИХ МЕЖДУ СОБОЙ ЗАПЯТЫМИ. ЕСЛИ КАРТИНКИ КОНЧИЛИСЬ, ВСТАВЛЯЕМ ";".
                    ЕСЛИ КАРТИНКИ ПАРСЯТСЯ ПОСЛЕДНИМИ В ЭТОМ ОБЪЕКТЕ, ТО ВСТАВЛЯЕМ ПЕРЕНОС СТРОКИ

                    */
                    text = `${text}${product[prop].toString()}${j === columnsTitles.length - 1 ? '\n' : ';'}`;
                else if (prop === 'props') {
                    let props = '';
                    for (let index = 0; index < product[prop].length; index++) {
                        /*

                        ВСТАВЛЯЕМ ДОП. СВОЙСТВА ТОВАРА ПО ШАБЛОНУ "<НАЗВАНИЕ>:<ЗНАЧЕНИЕ>", МЕЖДУ СОБОЙ СВОЙСТВА
                        РАЗДЕЛЯЕМ ЗАПЯТЫМИ

                         */
                        props = `${props}${product[prop][index].name}:${product[prop][index].value}${index === product[prop].length - 1 ? '' : ','}`;
                    }
                    /*

                    ЕСЛИ ДОП. СВОЙСТВА ТОВАРА ПАРСЯТСЯ ПОСЛЕДНИМИ В ОБЪЕКТЕ, ТО ВСТАВЛЯЕМ ПЕРЕНОС СТРОКИ, ИНАЧЕ
                    ВСТАВЛЯЕМ ";"

                     */
                    text = `${text}${props}${j === columnsTitles.length - 1 ? '\n' : ';'}`;
                }
                else // ЕСЛИ СВОЙСТВО - ОБЫЧНАЯ СТРОКА, ТО ВСТАВЛЯЕМ КАК ОБЫЧНУЮ СТРОКУ.
                    text = `${text}${product[prop]}${j === columnsTitles.length - 1 ? '\n' : ';'}`;
            }
        }
        return text;
    }
};