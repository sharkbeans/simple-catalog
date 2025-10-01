import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AuditLogs({ logs }) {
    const [filterAction, setFilterAction] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLogs, setExpandedLogs] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const toggleLogDetails = (logId) => {
        setExpandedLogs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(logId)) {
                newSet.delete(logId);
            } else {
                newSet.add(logId);
            }
            return newSet;
        });
    };

    const formatGMT8Time = (dateString) => {
        const date = new Date(dateString);
        const options = {
            timeZone: 'Asia/Singapore', // GMT+8
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'created':
            case 'created_via_csv':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'updated':
            case 'updated_via_csv':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'deleted':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'hidden':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'shown':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'created':
            case 'created_via_csv':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                );
            case 'updated':
            case 'updated_via_csv':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                );
            case 'deleted':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                );
            case 'hidden':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                );
            case 'shown':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const renderChanges = (log) => {
        if (log.action === 'created' || log.action === 'created_via_csv') {
            return (
                <div className="mt-2 text-sm">
                    <p className="font-medium text-gray-700 mb-1">New values:</p>
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                        {Object.entries(log.new_values || {}).map(([key, value]) => (
                            <div key={key} className="text-gray-700">
                                <span className="font-medium">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (log.action === 'hidden' || log.action === 'shown') {
            return (
                <div className="mt-2 text-sm">
                    <div className={`p-3 rounded border ${log.action === 'hidden' ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                        <p className="text-gray-700">
                            Product visibility changed to: <span className="font-semibold">{log.action === 'hidden' ? 'Hidden' : 'Visible'}</span>
                        </p>
                        {log.old_values?.is_hidden !== undefined && log.new_values?.is_hidden !== undefined && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`px-2 py-1 rounded border text-xs ${log.old_values.is_hidden ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-blue-100 border-blue-300 text-blue-700'}`}>
                                    {log.old_values.is_hidden ? 'Was Hidden' : 'Was Visible'}
                                </span>
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className={`px-2 py-1 rounded border text-xs ${log.new_values.is_hidden ? 'bg-gray-100 border-gray-300 text-gray-700' : 'bg-blue-100 border-blue-300 text-blue-700'}`}>
                                    {log.new_values.is_hidden ? 'Now Hidden' : 'Now Visible'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (log.action === 'updated' || log.action === 'updated_via_csv') {
            return (
                <div className="mt-2 text-sm space-y-2">
                    {Object.keys(log.new_values || {}).map((key) => {
                        const oldValue = log.old_values?.[key];
                        const newValue = log.new_values?.[key];

                        if (oldValue !== newValue) {
                            return (
                                <div key={key} className="flex items-start gap-2">
                                    <span className="font-medium text-gray-700 min-w-[100px]">{key}:</span>
                                    <div className="flex-1 flex items-center gap-2">
                                        <span className="bg-red-50 px-2 py-1 rounded border border-red-200 text-red-800 line-through">
                                            {typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        <span className="bg-green-50 px-2 py-1 rounded border border-green-200 text-green-800">
                                            {typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)}
                                        </span>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            );
        }

        if (log.action === 'deleted') {
            return (
                <div className="mt-2 text-sm">
                    <p className="font-medium text-gray-700 mb-1">Deleted values:</p>
                    <div className="bg-red-50 p-2 rounded border border-red-200">
                        {Object.entries(log.old_values || {}).map(([key, value]) => (
                            <div key={key} className="text-gray-700">
                                <span className="font-medium">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return null;
    };

    const filteredLogs = logs.filter(log => {
        const matchesAction = filterAction === 'all' || log.action === filterAction;
        const matchesSearch = !searchTerm ||
            log.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.product?.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.new_values?.product_code?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesAction && matchesSearch;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterAction, searchTerm]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Audit Logs
                </h2>
            }
        >
            <Head title="Audit Logs" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by product name or product code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Action Filter */}
                                <div>
                                    <select
                                        value={filterAction}
                                        onChange={(e) => setFilterAction(e.target.value)}
                                        className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Actions</option>
                                        <option value="created">Created</option>
                                        <option value="created_via_csv">Created via CSV</option>
                                        <option value="updated">Updated</option>
                                        <option value="updated_via_csv">Updated via CSV</option>
                                        <option value="deleted">Deleted</option>
                                        <option value="hidden">Hidden</option>
                                        <option value="shown">Shown</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} {filteredLogs.length !== logs.length && `(filtered from ${logs.length})`} log entries
                            </div>
                        </div>
                    </div>

                    {/* Audit Logs Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {filteredLogs.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">No audit logs found</h3>
                                <p className="mt-1 text-gray-500">
                                    {filterAction !== 'all' || searchTerm ? 'Try adjusting your filters' : 'Start making changes to see audit logs here'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date & Time
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Action
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product Code
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Details
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paginatedLogs.map((log) => (
                                                <React.Fragment key={log.id}>
                                                    <tr className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatGMT8Time(log.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className={`flex-shrink-0 p-1.5 rounded border ${getActionColor(log.action)}`}>
                                                                    {getActionIcon(log.action)}
                                                                </div>
                                                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getActionColor(log.action)}`}>
                                                                    {log.action.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {log.product_name || 'Unknown Product'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {log.product?.product_code || log.new_values?.product_code || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <button
                                                                onClick={() => toggleLogDetails(log.id)}
                                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                            >
                                                                {expandedLogs.has(log.id) ? (
                                                                    <>
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                        </svg>
                                                                        Hide
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                        View
                                                                    </>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedLogs.has(log.id) && (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-4 bg-gray-50">
                                                                {renderChanges(log)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                        <div className="flex-1 flex justify-between sm:hidden">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                                    currentPage === 1
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                                    currentPage === totalPages
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Page <span className="font-medium">{currentPage}</span> of{' '}
                                                    <span className="font-medium">{totalPages}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                                            currentPage === 1
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span className="sr-only">Previous</span>
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>

                                                    {/* Page numbers */}
                                                    {[...Array(totalPages)].map((_, idx) => {
                                                        const pageNumber = idx + 1;
                                                        // Show first page, last page, current page, and pages around current
                                                        if (
                                                            pageNumber === 1 ||
                                                            pageNumber === totalPages ||
                                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={pageNumber}
                                                                    onClick={() => setCurrentPage(pageNumber)}
                                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                        currentPage === pageNumber
                                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    {pageNumber}
                                                                </button>
                                                            );
                                                        } else if (
                                                            pageNumber === currentPage - 2 ||
                                                            pageNumber === currentPage + 2
                                                        ) {
                                                            return (
                                                                <span
                                                                    key={pageNumber}
                                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                                                >
                                                                    ...
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}

                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                                            currentPage === totalPages
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span className="sr-only">Next</span>
                                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}