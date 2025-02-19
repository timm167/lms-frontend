import React, { useState, useMemo } from 'react';
import { useTable, useExpanded, useFilters, useSortBy } from 'react-table';
import '@/css/table.css';
import { handleGetRowItem } from '@get/getObjects';
import { useAppContext } from '@/AppContext';

const DefaultColumnFilter = ({
    column: { filterValue, preFilteredRows, setFilter },
}) => {
    const count = preFilteredRows.length;

    return (
        <input
            value={filterValue || ''}
            onChange={e => {
                setFilter(e.target.value || undefined); 
            }}
            placeholder={`Search ${count} records...`}
            className='filter-input'
        />
    );
};

const BaseTable = ({ data, columns, rowType }) => {
    const { setViewObject, filtersOn, setPage, setViewType} = useAppContext();


    const defaultColumn = useMemo(
        () => ({
            Filter: DefaultColumnFilter,
        }),
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable(
        {
            columns,
            data,
            defaultColumn, 
        },
        useFilters, 
        useSortBy,
        useExpanded
    );

    const handleRowClick = async (event, row) => {
        if (event.target.tagName.toLowerCase() === 'button') {
            return; // Do nothing if a button was clicked
        }
        try {
            const viewObject = await handleGetRowItem(row.original, rowType);
            if (['courses', 'enrollments'].includes(rowType)) {
                setViewObject(viewObject);
                setViewType('courses');
                setPage('ObjectViewer')
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <table {...getTableProps()} className="table base-table">
            <thead className="table-header">
                {headerGroups.map((headerGroup, headerGroupIndex) => {
                    const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                        <tr key={headerGroupKey || headerGroupIndex} {...headerGroupProps} className="table-header-row">
                            {headerGroup.headers.map((column, columnIndex) => {
                                const { key: columnKey, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                                return (
                                    <th key={columnKey || columnIndex} {...columnProps} className="table-header-cell-element">
                                        <div className="table-header-cell">
                                            {column.render('Header')}
                                            <span>
                                                {column.isSorted
                                                    ? column.isSortedDesc
                                                        ? '  ▼'
                                                        : '  ▲'
                                                    : ''}
                                            </span>
                                            {/* Render the filter UI */}
                                        </div>
                                        <div 
                                            className={`${filtersOn ? 'filter' : 'hidden'}`}
                                            onClick={(e) => e.stopPropagation()}
                                            >{column.canFilter ? column.render('Filter') : null}
                                            
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    );
                })}
            </thead>
            <tbody {...getTableBodyProps()} className="table-body">
                {rows.map((row, rowIndex) => {
                    prepareRow(row);
                    const { key: rowKey, ...rowProps } = row.getRowProps();
                    return (
                        <tr key={rowKey || rowIndex} {...rowProps} className="table-body-row">
                            {row.cells.map((cell, cellIndex) => {
                                const { key: cellKey, ...cellProps } = cell.getCellProps();
                                return (
                                    <td 
                                        key={cellKey || cellIndex} 
                                        {...cellProps} 
                                        className="table-body-cell"
                                        onClick={cellIndex !== row.cells.length - 1 ? (event) => handleRowClick(event, row) : undefined}
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

const ExpandableList = ({ data, label, itemKey, itemLabel }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    if (!data || data.length == 0) return <span>No {label}</span>;
    const numItems = data.length;


    return (
        <div className="expandable-list-container">
            <button onClick={() => setIsExpanded(!isExpanded)} className="expandable-list-button">
                {isExpanded ? `▼` : `▶`} {label} ({numItems})
            </button>
            {isExpanded && (
                <ul className="expandable-list">
                    {data.map((item, index) => (
                        <div key={`${item[itemKey]}-${index}`} className="expandable-list-item-container">
                            <li className="expandable-list-item">
                                {item[itemLabel]}
                            </li>
                        </div>
                    ))}
                </ul>
            )}
        </div>
    );
};

export { ExpandableList, BaseTable, DefaultColumnFilter };