"use client";

import { useEffect, useState } from "react";
import ModalProps from "@/interfaces/ModalProps";
import Cookies from "js-cookie";
import { Document } from "@/interfaces/Document";
import axios from "axios";

interface DocumentModalProps extends ModalProps {
  id: string;
  userRole: string; // Injected from parent
}

const DocumentModal = ({ id, onClose, onSave, userRole }: DocumentModalProps) => {
  const [formData, setFormData] = useState<Partial<Document>>({});
  const token = Cookies.get('sempoa');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!id) return;
    const fetchBasicData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/documents/${id}`, {
          headers: { Authorization : `Bearer ${token}` }
        });
        setFormData({
          ...res.data,
          status: res.data.status || "development",
        });
      } catch (err) {
        console.error("Failed to fetch document detail", err);
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
    onSave(payload as Document);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-8/12">
        <h2 className="text-xl font-bold mb-4">{formData?.id ? "Edit" : "Create"} document</h2>
        <form onSubmit={handleSubmit}>
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

export default DocumentModal;