"use client";

import { useEffect, useState } from "react";
import ModalProps from "@/interfaces/ModalProps";
import Cookies from "js-cookie";
import Project from "@/interfaces/Project";

interface ProjectModalProps extends ModalProps {
  id: string;
  userRole: string; // Injected from parent
}

const ProjectModal = ({ id, onClose, onSave, userRole }: ProjectModalProps) => {
  const [formData, setFormData] = useState<Partial<Project>>({});
  const token = Cookies.get('sempoa');

  useEffect(() => {
    if (!id) return;
    const fetchBasicData = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          headers: { Authorization : `Bearer ${token}` }
        });
        const json = await res.json();
        setFormData({
          ...json.data,
          status: json.data.status || "development",
        });
      } catch (err) {
        console.error("Failed to fetch project detail", err);
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
    onSave(payload as Project);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-8/12">
        <h2 className="text-xl font-bold mb-4">{formData?.id ? "Edit" : "Create"} Project</h2>
        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <input
              type="text"
              name="projectName"
              value={formData?.projectName || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Trading Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Project Code</label>
            <input
              type="text"
              name="projectCode"
              value={formData?.projectCode || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData?.description || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
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

export default ProjectModal;