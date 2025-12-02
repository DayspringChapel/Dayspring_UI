'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';

export default function RequisitionsPage() {
    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequisitions();
    }, []);

    const loadRequisitions = async () => {
        try {
            const data = await apiClient.getRequisitions();
            setRequisitions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load requisitions:', error);
            setRequisitions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm('Are you sure you want to approve this requisition?')) return;

        try {
            await apiClient.approveRequisition(id);
            await loadRequisitions();
        } catch (error) {
            console.error('Failed to approve requisition:', error);
            alert('Failed to approve requisition. Please try again.');
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            0: { label: 'Pending', className: 'pending' },
            1: { label: 'Approved', className: 'confirmed' },
            2: { label: 'Rejected', className: 'cancelled' },
        };
        const statusInfo = statusMap[status] || statusMap[0];
        return <span className={`${styles.badge} ${styles[statusInfo.className]}`}>{statusInfo.label}</span>;
    };

    if (loading && requisitions.length === 0) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading requisitions...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Requisitions</h1>
                <p>Review and approve requisition requests</p>
            </div>

            {requisitions.length === 0 ? (
                <div className={styles.empty}>
                    <p>No requisitions found.</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Requestor</th>
                                <th>Department</th>
                                <th>Description</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requisitions.map((req) => {
                                const total = req.items?.reduce(
                                    (sum, item) => sum + (item.quantity * item.unitPrice || 0),
                                    0
                                ) || 0;

                                return (
                                    <tr key={req.id}>
                                        <td>{req.requestorName}</td>
                                        <td>{req.department}</td>
                                        <td>{req.description}</td>
                                        <td>{req.items?.length || 0} items</td>
                                        <td>${total.toFixed(2)}</td>
                                        <td>{getStatusBadge(req.status || 0)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                {req.status !== 1 && (
                                                    <button
                                                        className={styles.confirmBtn}
                                                        onClick={() => handleApprove(req.id)}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
