export default class Parser {
    static csv2json(data) {
        const parsed = [];
        const content = data.substring(0, data.length - 2); // удаляем завершающий \n
        const rows = content.split('\n');
        const columnsTitles = rows[0].split(','); // первая строка - заголовки столбцов
        for (let i = 1; i <= rows.length - 1; i++) {
            const row = rows[i];
            const rowElements = row.split(',');
            const parsedItem = {};
            for (let j = 0; j < rowElements.length; j++) {
                parsedItem[columnsTitles[j]] = rowElements[j];
            }
            parsed.push(parsedItem);
        }
        return parsed;
    };
};