import React from 'react';
import { useTable } from 'react-table';

const ListView = ({ brushedItems }) => {
    // Define columns and data for the table
    const columns = React.useMemo(
        () => [
            {
                Header: 'Image',
                accessor: 'id',
                Cell: ({ cell: { value } }) => (
                    <div className="td-image">
                        <img
                            src={`https://fashionalign.s3.ap-northeast-2.amazonaws.com/${value}.jpg`}
                            alt={`Item ${value}`}
                        />
                    </div>
                ),
            },
            {
                Header: 'Short Description',
                accessor: 'shortDescription',
                Cell: ({ cell: { value } }) => <div className="td-description">{value}</div>,
            },
        ],
        []
    );

    // Pass data to the table
    const data = React.useMemo(() => brushedItems, [brushedItems]);

    // Use the useTable hook to create the table instance
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <div className="list-view-container">
            <div className="label-button-header">
                <div className="component-header">Selected Items</div>
            </div>
            <div>
                <table {...getTableProps()} className="list-content">
                    <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListView;










