import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AuditLogs({ logs }) {
    const [filterAction, setFilterAction] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLogs, setExpandedLogs] = useState(new Set());

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
                return 'bg-green-100 text-green-800 border-green-200';
            case 'updated':
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
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                );
            case 'updated':
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
        if (log.action === 'created') {
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

        if (log.action === 'updated') {
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
            log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesAction && matchesSearch;
    });

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
                                        placeholder="Search by product name or user..."
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
                                        <option value="updated">Updated</option>
                                        <option value="deleted">Deleted</option>
                                        <option value="hidden">Hidden</option>
                                        <option value="shown">Shown</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                Showing {filteredLogs.length} of {logs.length} log entries
                            </div>
                        </div>
                    </div>

                    {/* Audit Logs */}
                    <div className="space-y-4">
                        {filteredLogs.length === 0 ? (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">No audit logs found</h3>
                                    <p className="mt-1 text-gray-500">
                                        {filterAction !== 'all' || searchTerm ? 'Try adjusting your filters' : 'Start making changes to see audit logs here'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filteredLogs.map((log) => (
                                <div key={log.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow group">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                {/* Action Icon */}
                                                <div className={`flex-shrink-0 p-2 rounded-lg border ${getActionColor(log.action)}`}>
                                                    {getActionIcon(log.action)}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getActionColor(log.action)}`}>
                                                            {log.action.toUpperCase()}
                                                        </span>
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {log.product_name || 'Unknown Product'}
                                                        </h3>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {log.user?.name || 'Unknown User'}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {formatGMT8Time(log.created_at)} (GMT+8)
                                                        </div>
                                                        {log.product_id && (
                                                            <div className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                                </svg>
                                                                Product ID: {log.product_id}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Changes - Collapsed by default */}
                                                    {expandedLogs.has(log.id) && (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            {renderChanges(log)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* View Details Button - Only visible on hover or when expanded */}
                                            <div className={`flex-shrink-0 ml-4 transition-opacity duration-200 ${expandedLogs.has(log.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                <button
                                                    onClick={() => toggleLogDetails(log.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                >
                                                    {expandedLogs.has(log.id) ? (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            </svg>
                                                            Hide Details
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                            View Details
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}