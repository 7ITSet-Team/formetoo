const fs = require('fs');
const path = require('path');

module.exports = _path => {
	const _iconsPath = path.join(_path, '/icons');
	const iconFiles = fs.readdirSync(_iconsPath).sort();

	const about =
		`\n//Стили иконок и иконочного шрифта. Сгенерированы.\n//Имена стилей - по именам файлов иконок в папке темы.
//У всех svg-иконок должен быть тег height - относительно него выполняется масштабирование шрифта.\n\n.icon{
	display: inline-block;
	font: normal normal normal 14px/1 FontAwesome;
	font-size: inherit;
	text-rendering: auto;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	vertical-align: middle;
	text-align: center;
	user-select:none;
	
	&:before{
		vertical-align: middle;
		text-align: center;
	}
	
`;

	const iconStyles = about + iconFiles.map(file => {
		const basename = path.basename(file);
		const nameWithoutExtension = basename.split('.')[0];
		return `  &.${nameWithoutExtension}:before {font-icon: url('./icons/${basename}')}`;
	}).join('\n') + '\n}';
	fs.writeFileSync(_path + '/icons.less', iconStyles);
};