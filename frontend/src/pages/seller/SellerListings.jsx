import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  Edit,
  Trash2,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { partsService, categoryService } from '../../services/api';
import { StatusBadge, ConditionBadge } from '../../components/common/ConditionBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const SellerListings = () => {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Modal State
  const [editingPart, setEditingPart] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const toast = useToast();

  const loadListings = async () => {
    try {
      const [listRes, catRes] = await Promise.all([
        partsService.getSellerListings(),
        categoryService.getCategories()
      ]);
      if (listRes.data?.parts) setListings(listRes.data.parts);
      if (catRes.data?.categories) setCategories(catRes.data.categories);
    } catch (err) {
      toast.error('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete listing "${name}"?`)) return;
    try {
      await partsService.delete(id);
      toast.success('Listing deleted.');
      setListings((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete listing.');
    }
  };

  const openEditModal = (part) => {
    setEditingPart(part);
    setEditFormData({
      name: part.name,
      category_id: part.category_id,
      brand: part.brand || '',
      model_number: part.model_number || '',
      description: part.description || '',
      condition_state: part.condition_state,
      quantity: part.quantity,
      price: part.price,
      location: part.location || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const data = new FormData();
      Object.keys(editFormData).forEach((k) => data.append(k, editFormData[k]));

      await partsService.update(editingPart.id, data);
      toast.success('Listing updated.');
      setEditingPart(null);
      loadListings();
    } catch (err) {
      toast.error(err.message || 'Failed to update listing.');
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Machine Part Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your active stock, monitor approval statuses, and update pricing</p>
        </div>
        <Link
          to="/seller/add-part"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Part</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'approved', 'pending', 'rejected', 'sold'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              statusFilter === status
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status} ({status === 'all' ? listings.length : listings.filter(l => l.status === status).length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6">
        {loading ? (
          <TableSkeleton rows={4} />
        ) : filteredListings.length === 0 ? (
          <EmptyState
            title="No listings found"
            description="You don't have any listings in this status tab."
            actionText="Add a Machine Part"
            actionLink="/seller/add-part"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Surplus Valuation</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredListings.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || '/uploads/siemens-motor.jpg'}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-900"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {p.brand} {p.model_number ? `• PN: ${p.model_number}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{p.category_name}</td>
                    <td className="py-4 px-4">
                      <ConditionBadge condition={p.condition_state} />
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{p.quantity}</td>
                    <td className="py-4 px-4 text-slate-700">₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹{(p.quantity * p.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/parts/${p.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                          title="View Public Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                          title="Edit Part"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                          title="Delete Part"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Part Modal */}
      {editingPart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Machine Part</h3>
              <button onClick={() => setEditingPart(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Part Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={editFormData.category_id}
                    onChange={(e) => setEditFormData({ ...editFormData, category_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Condition</label>
                  <select
                    value={editFormData.condition_state}
                    onChange={(e) => setEditFormData({ ...editFormData, condition_state: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {['New / Unused', 'Surplus', 'Like New', 'Used - Good', 'Used - Fair'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Technical Description</label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPart(null)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
