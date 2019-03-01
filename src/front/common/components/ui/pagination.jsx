import React from 'react';

export default class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.totalLinks = 5;
    }

    renderLinks() {
        const {totalPages, page, goToPage} = this.props;
        const links = [];
        const radius = ((this.totalLinks - 1) / 2);

        let start;
        if (page <= radius)
            start = 1;
        else
            start = page - radius;

        let end = start + this.totalLinks - 1;
        if (end > totalPages) {
            end = totalPages;
            start = end - this.totalLinks + 1;
            if (start < 1)
                start = 1;
        }

        for (let i = start; i <= end; i++)
            links.push(i);

        if (totalPages > 1)
            return (
                <>
                    <span onClick={() => (page > 1) && goToPage(page - 1)}> Назад </span>
                    {links.map(link => {
                        if (link === page)
                            return <span style={{color: 'red'}} onClick={() => goToPage(link)}
                                         key={link}> {link} </span>;
                        return <span onClick={() => goToPage(link)} key={link}> {link} </span>;
                    })}
                    <span onClick={() => (page < totalPages) && goToPage(page + 1)}> Вперед </span>
                </>
            )
    };

    render() {
        return (
            <div>
                {this.renderLinks()}
            </div>
        )
    }
}