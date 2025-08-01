"use client";

import { useEffect, useState } from "react";
import ModalProps from "@/interfaces/ModalProps";
import Cookies from "js-cookie";
import Company from "@/interfaces/Company";

interface CompanyModalProps extends ModalProps {
  id: string;
  userRole: string; // Injected from parent
}

const CompanyModal = ({ id, onClose, onSave, userRole }: CompanyModalProps) => {
  const [formData, setFormData] = useState<Partial<Company>>({});
  const token = Cookies.get('sempoa');

  useEffect(() => {
    if (!id) return;
    const fetchBasicData = async () => {
      try {
        const res = await fetch(`/api/companies/${id}`, {
          headers: { Authorization : `Bearer ${token}` }
        });
        const json = await res.json();
        setFormData({
          ...json.data,
          status: json.data.status || "development",
        });
      } catch (err) {
        console.error("Failed to fetch company detail", err);
      }
    };
    fetchBasicData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = { ...formData };
    onSave(payload as Company);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-8/12">
        <h2 className="text-xl font-bold mb-4">{formData?.id ? "Edit" : "Create"} Company</h2>
        <form onSubmit={handleSubmit}>
          {/* Company Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData?.companyName || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Trading Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Trading Name</label>
            <input
              type="text"
              name="tradingName"
              value={formData?.tradingName || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Company Code */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Company Code</label>
            <input
              type="text"
              name="companyCode"
              value={formData?.companyCode || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              name="address"
              value={formData?.address || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="text"
              name="email"
              value={formData?.email || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData?.phoneNumber || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 mr-2">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyModal;