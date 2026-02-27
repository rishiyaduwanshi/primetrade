import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks.js';

const STATUSES = ['todo', 'in-progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

const BADGE = {
  todo: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
  low: 'bg-blue-100 text-blue-600',
  medium: 'bg-orange-100 text-orange-600',
  high: 'bg-red-100 text-red-600',
};

const emptyForm = { title: '', description: '', status: 'todo', priority: 'medium' };

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, limit: 8 });
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Modal / form state
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const res = await getTasks(params);
      setTasks(res.data.data.tasks);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditTarget(null);
    setModal('create');
  };

  const openEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
    });
    setEditTarget(task);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
    setForm(emptyForm);
  };

  const handleFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await createTask(form);
        toast.success('Task created!');
      } else {
        await updateTask(editTarget._id, form);
        toast.success('Task updated!');
      }
      closeModal();
      await fetchTasks(); // re-fetch so active filters are respected
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    setDeletingId(id);
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      await fetchTasks(); // re-fetch so active filters are respected
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
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
          <span className="text-sm text-gray-600">
            {user?.name || user?.email}{' '}
            <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${user?.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              {user?.role}
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

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 mt-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value, page: 1 }))}
            className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button
            onClick={() => setFilters({ status: '', priority: '', page: 1, limit: 8 })}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Reset
          </button>
        </div>

        {/* Task Grid */}
        {loadingTasks ? (
          <div className="text-center py-16 text-gray-400">Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No tasks yet.{' '}
            <button onClick={openCreate} className="text-blue-500 underline">
              Create one
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">{task.title}</h3>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(task)}
                      className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      disabled={deletingId === task._id}
                      className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-40"
                    >
                      {deletingId === task._id ? '…' : 'Del'}
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                )}

                <div className="flex gap-2 mt-auto flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[task.status]}`}>
                    {task.status}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>

                {user?.role === 'admin' && task.owner && (
                  <p className="text-xs text-gray-400 mt-1">by {task.owner.name || task.owner.email}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              {filters.page} / {pagination.pages}
            </span>
            <button
              disabled={filters.page >= pagination.pages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {modal === 'create' ? 'Create Task' : 'Edit Task'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Task title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Optional description…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Saving…' : modal === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
