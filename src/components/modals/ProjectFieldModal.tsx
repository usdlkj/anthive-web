"use client";

import { useEffect, useState } from "react";
import ModalProps from "@/interfaces/ModalProps";
import Cookies from "js-cookie";
import ProjectField from "@/interfaces/ProjectField";
import axios from "axios";

interface ProjectFieldModalProps extends ModalProps {
  id: string;
  userRole: string; // Injected from parent
  projectId: string;
}

const ProjectFieldModal = ({ id, onClose, onSave, userRole, projectId }: ProjectFieldModalProps) => {
  const [formData, setFormData] = useState<Partial<ProjectField>>({});
  const [fields, setFields] = useState<ProjectField[]>([]);
  const token = Cookies.get('sempoa');

  useEffect(() => {
    if (!id || !token) return;
    const fetchBasicData = async () => {
      try {
        const res = await axios.get(`/api/project-fields/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = res.data;
        setFormData({
          ...json.data,
          status: json.data.status || "development",
        });
      } catch (err) {
        console.error("Failed to fetch project field detail", err);
      }
    };
    fetchBasicData();
    // Fetch all fields for this project
    const fetchAllFields = async () => {
      try {
        const res = await axios.get(`/api/project-fields?projectId=${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = res.data;
        const maybeArray = Array.isArray(raw?.data?.data)
          ? raw.data.data
          : Array.isArray(raw?.data)
          ? raw.data
          : [];

        setFields(maybeArray);
      } catch (err) {
        console.error("Failed to fetch project fields list", err);
        setFields([]);
      }
    };
    fetchAllFields();
  }, [id, token, projectId]);

  const isDuplicateSequence = (sequence: number) => {
    return fields.some(field =>
      field.sequence === sequence && field.id !== formData?.id
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isCreate = !formData?.id;
    const payload = {
      ...formData,
      ...(isCreate && { projectId }),
    };
    onSave(payload as ProjectField);
  };

  useEffect(() => {
    if (formData.sequence && isDuplicateSequence(Number(formData.sequence))) {
      console.warn('Duplicate sequence number detected.');
    }
  }, [formData.sequence]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-8/12">
        <h2 className="text-xl font-bold mb-4">{formData?.id ? "Edit" : "Create"} Project Field</h2>
        <form onSubmit={handleSubmit}>


          {/* Field Code */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Field Code</label>
            <input
              type="text"
              name="fieldCode"
              value={formData?.fieldCode || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Field Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Field Text</label>
            <input
              type="text"
              name="fieldText"
              value={formData?.fieldText || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              name="type"
              value={formData?.type || "text"}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>

          {formData.type === "select" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Options (comma-separated)</label>
              <input
                type="text"
                name="options"
                value={(formData.options || []).join(', ')}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    options: e.target.value.split(',').map((s) => s.trim()),
                  }))
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Visible */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Visible?</label>
            <input
              type="checkbox"
              name="visible"
              checked={formData?.visible || false}
              onChange={handleChange}
              className="mr-2"
            />
          </div>

          {/* Mandatory */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Mandatory?</label>
            <input
              type="checkbox"
              name="mandatory"
              checked={formData?.mandatory || false}
              onChange={handleChange}
              className="mr-2"
            />
          </div>

          {/* Sequence */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Sequence</label>
            <input
              type="number"
              name="sequence"
              value={formData?.sequence || ""}
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

export default ProjectFieldModal;