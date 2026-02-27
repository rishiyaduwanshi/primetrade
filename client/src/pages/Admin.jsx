import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getUsers, updateUserRole, deleteUser } from '../api/admin.js';

const ROLE_BADGE = {
  admin: 'bg-purple-100 text-purple-700',
  user: 'bg-blue-100 text-blue-600',
};

export default function Admin() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    setUpdatingId(u._id);
    try {
      await updateUserRole(u._id, newRole);
      setUsers((prev) =>
        prev.map((item) => (item._id === u._id ? { ...item, role: newRole } : item))
      );
      toast.success(`${u.email} is now ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.email}"? This cannot be undone.`)) return;
    setDeletingId(u._id);
    try {
      await deleteUser(u._id);
      setUsers((prev) => prev.filter((item) => item._id !== u._id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-lg text-blue-600">PrimeTrade</span>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
          >
            ← Dashboard
          </Link>
          <span className="text-sm text-gray-600">
            {user?.name || user?.email}{' '}
            <span className="text-xs px-2 py-0.5 rounded-full ml-1 bg-purple-100 text-purple-600">
              admin
            </span>
          </span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">User Management</h2>
          <span className="text-sm text-gray-500">{users.length} user{users.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-sm">No users found.</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{u.name || '—'}</div>
                      <div className="text-gray-400 text-xs">{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Don't allow changing own role */}
                        {u._id !== user?._id && (
                          <button
                            onClick={() => handleRoleToggle(u)}
                            disabled={updatingId === u._id}
                            className="text-xs px-3 py-1 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 disabled:opacity-50 transition"
                          >
                            {updatingId === u._id
                              ? '...'
                              : u.role === 'admin'
                                ? 'Make User'
                                : 'Make Admin'}
                          </button>
                        )}
                        {u._id !== user?._id && (
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deletingId === u._id}
                            className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 transition"
                          >
                            {deletingId === u._id ? '...' : 'Delete'}
                          </button>
                        )}
                        {u._id === user?._id && (
                          <span className="text-xs text-gray-400 italic">You</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
