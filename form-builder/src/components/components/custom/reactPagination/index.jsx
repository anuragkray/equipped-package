import React from 'react';
import ReactPaginate from "react-paginate";
import { ArrowLeft } from '@phosphor-icons/react';

const ReactPaginationStyle = ({ total, currentPage, handlePagination, limit }) => {
    const pageCount = Math.max(1, Math.ceil(total / limit)); // Ensure at least 1 page

    return (
        <ReactPaginate
            previousLabel={<ArrowLeft size={20} weight="bold" className="dark:text-gray-300 text-2xl text-textBrandSecondary " />}
            nextLabel={<ArrowLeft size={20} weight="bold" className="dark:text-gray-300 text-2xl text-textBrandSecondary  rotate-180" />}
            pageCount={pageCount}
            breakLabel="..."
            pageRangeDisplayed={1}
            marginPagesDisplayed={1}
            forcePage={Math.max(0, currentPage - 1)} // Ensure it stays in range
            onPageChange={(selected) => handlePagination(selected.selected + 1)} // Return page number (1-based)
            activeLinkClassName="bg-surfaceControlSelected text-textBrandSecondary dark:text-gray-300 dark:bg-textBrandPrimary w-6 h-6 rounded-md flex justify-center items-center"
            pageClassName="flex justify-center   items-center rounded-md h-6 w-6"
            containerClassName="pagination react-paginate flex gap-2 justify-end my-2 dark:text-gray-300 rounded-md text-sm"
        />
    );
};

export default ReactPaginationStyle;
