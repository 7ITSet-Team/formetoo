import React from 'react';

import Loading from '@components/ui/loading';

export default class Layout extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <div>
                Страница текущего пользователя (для клиентов отображается только она, без боковой панели и в ней вся работа с заказами и прочим)\nНе готово.
            </div>
        );
    };
};