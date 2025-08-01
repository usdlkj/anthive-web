"use client";

import ModalProps from "@/interfaces/ModalProps";
import User from "@/interfaces/User";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import axios from "axios";

const UserModal = ({ data, onClose, onSave }: ModalProps & { onSave?: () => void }) => {
  const [formData, setFormData] = useState<User | null>(data || null);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    setFormData(data);
  }
  , [])

  const isNewUser = !formData?.id;

const handleSave = async () => {
  if (!formData) return;

  const { name, email, password, role } = formData;
  const newErrors: { [key: string]: string } = {};

  if (!name) newErrors.name = 'Name is required';
  if (!email) {
    newErrors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
    }
  }
  if (!role) {
    newErrors.role = 'Role is required';
  }

  if (isNewUser || showPasswordFields) {
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        newErrors.password = 'Must contain uppercase, lowercase, number, and be at least 8 characters';
      }
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  const url = isNewUser ? '/api/users' : `/api/users/${formData.id}`;
  const method = isNewUser ? 'POST' : 'PATCH';
  const token = Cookies.get('sempoa');

  try {
    const { id, ...rest } = formData;
    const payload = isNewUser ? rest : { id, ...rest };

    await axios({
      method,
      url,
      data: payload,
      headers: { 'Authorization': `Bearer ${token}` },
    });

    onSave?.();
    onClose();
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>User</DialogTitle>
        </DialogHeader>
        <form>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData?.name || ""}
              onChange={(e) => setFormData(prev => prev ? { ...prev, name: e.target.value } : prev)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="email"
              value={formData?.email || ""}
              onChange={(e) => setFormData(prev => prev ? { ...prev, email: e.target.value } : prev)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData?.phoneNumber || ""}
              onChange={(e) => setFormData(prev => prev ? { ...prev, phoneNumber: e.target.value } : prev)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Role<span className="text-red-500">*</span></label>
            <select
              name="role"
              value={formData?.role || ""}
              onChange={(e) => setFormData(prev => prev ? { ...prev, role: e.target.value } : prev)}
              className="w-full px-3 py-2 border rounded bg-gray-100"
            >
              <option value="">-- Select Role --</option>
              <option value="super">Super Admin</option>
              <option value="ops">Ops Admin</option>
              <option value="admin">Company Admin</option>
              <option value="user">User</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          {!isNewUser && !showPasswordFields && (
            <div className="mb-4">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setShowPasswordFields(true)}
              >
                Change Password
              </button>
            </div>
          )}

          {(isNewUser || showPasswordFields) && (
            <>
              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setFormData((prev) => (prev ? { ...prev, password: e.target.value } : prev))
                  }
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Confirm Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirm"
                  value={confirmPassword}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;