import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Package,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { partsService, categoryService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AddPart = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    brand: '',
    model_number: '',
    description: '',
    condition_state: 'Surplus',
    quantity: 1,
    price: '',
    location: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res.data?.categories) {
          setCategories(res.data.categories);
          if (res.data.categories.length > 0) {
            setFormData((prev) => ({ ...prev, category_id: res.data.categories[0].id }));
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be under 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) return toast.error('Part name is required.');
    if (!formData.category_id) return toast.error('Please select a valid category.');
    if (!formData.price || parseFloat(formData.price) <= 0) return toast.error('Valid price in INR is required.');
    if (!formData.quantity || parseInt(formData.quantity, 10) <= 0) return toast.error('Quantity must be 1 or greater.');

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('category_id', formData.category_id);
      data.append('brand', formData.brand.trim());
      data.append('model_number', formData.model_number.trim());
      data.append('description', formData.description.trim());
      data.append('condition_state', formData.condition_state);
      data.append('quantity', formData.quantity);
      data.append('price', formData.price);
      data.append('location', formData.location.trim());

      if (imageFile) {
        data.append('image', imageFile);
      }

      await partsService.create(data);
      toast.success('Machine part listing submitted! It will be reviewed by an administrator before appearing live.');
      navigate('/seller/listings');
    } catch (err) {
      toast.error(err.message || 'Failed to submit listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const conditions = [
    'New / Unused',
    'Surplus',
    'Like New',
    'Used - Good',
    'Used - Fair'
  ];

  const calculatedTotal = (
    (parseInt(formData.quantity, 10) || 0) * (parseFloat(formData.price) || 0)
  ).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Inventory Onboarding</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">List a Surplus Machine Part</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete the engineering specifications and physical condition to list your equipment lot.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            <span>Component Identity & Classification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Part Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Siemens 5 HP Industrial Motor"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Condition <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.condition_state}
                onChange={(e) => setFormData({ ...formData, condition_state: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Manufacturer / Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Siemens, SKF, Rexroth, ABB"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Model / Serial Number</label>
              <input
                type="text"
                value={formData.model_number}
                onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                placeholder="e.g. 1LE1001-1DB22-2AA4"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Pricing, Quantity & Inventory Valuation */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-orange-500" />
            <span>Pricing & Inventory Valuation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quantity in Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Unit Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 38500"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Dispatch Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Pune, Maharashtra"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Live Valuation Pill */}
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs text-orange-950">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-600" />
              <span>Surplus Value Contribution (Quantity × Price):</span>
            </div>
            <span className="text-base font-black text-orange-600">{calculatedTotal}</span>
          </div>
        </div>

        {/* Technical Description */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Detailed Technical Specifications & Condition Notes
          </label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Include voltage, RPM, kilowatt ratings, seal type, bore diameters, packaging condition, or reason for surplus..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
          ></textarea>
        </div>

        {/* Image Upload with Preview */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 block mb-1">Machine Part Photo</label>

          {imagePreview ? (
            <div className="relative w-48 h-36 rounded-2xl overflow-hidden border border-slate-300 shadow-sm group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-orange-50/20 transition-all">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Click to upload photo or drag & drop</span>
              <span className="text-[10px] text-slate-400 mt-1">JPG, PNG, WEBP, or SVG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Approval Notice */}
        <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            All newly submitted machinery spares receive an initial status of <strong>Pending</strong>. An administrator will review your technical specifications for catalog accuracy before releasing it live to buyers.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/seller/listings')}
            className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-600/25 transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Part Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};
