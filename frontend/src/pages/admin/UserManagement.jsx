
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUserByAdmin } from '../../redux/adminSlice';
import { FiUsers, FiToggleLeft, FiToggleRight, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const UserManagement = () => {
    const dispatch = useDispatch();
    const { users, status } = useSelector(state => state.admin);

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    const handleRoleChange = (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        dispatch(updateUserByAdmin({ userId, userData: { role: newRole } }));
    };

    const handleStatusChange = (userId, currentStatus) => {
        dispatch(updateUserByAdmin({ userId, userData: { isActive: !currentStatus } }));
    };

    if (status === 'loading') {
        return <div className="text-center p-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
    }

    return (
        <div className="min-h-screen bg-base-200 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-3"><FiUsers /> Kullanıcı Yönetimi</h1>
                <div className="overflow-x-auto bg-base-100 rounded-box shadow-xl">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Kullanıcı Adı</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={user.avatar?.url || `https://ui-avatars.com/api/?name=${user.username}`} alt="Avatar" />
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td><div className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>{user.role}</div></td>
                                    <td>
                                        {user.isActive 
                                            ? <span className="text-success flex items-center gap-1"><FiCheckCircle /> Aktif</span> 
                                            : <span className="text-error flex items-center gap-1"><FiXCircle /> Pasif</span>
                                        }
                                    </td>
                                    <td className="flex flex-col gap-2">
                                        <button onClick={() => handleRoleChange(user._id, user.role)} className="btn btn-sm btn-outline">
                                            {user.role === 'admin' ? 'Kullanıcı Yap' : 'Admin Yap'}
                                        </button>
                                        <button onClick={() => handleStatusChange(user._id, user.isActive)} className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}>
                                            {user.isActive ? 'Pasif Yap' : 'Aktif Et'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;