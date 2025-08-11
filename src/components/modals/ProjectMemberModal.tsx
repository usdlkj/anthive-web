"use client";

import { useEffect, useState } from "react";
import ModalProps from "@/interfaces/ModalProps";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axios";
import ProjectMember from "@/interfaces/ProjectMember";
import User from "@/interfaces/User";

interface ProjectMemberModalProps extends ModalProps {
  id?: string;            // member id (optional when creating)
  userRole: string;       // from parent, if you want to gate actions
  projectId: string;      // required to create
}

type ProjectMemberForm = Partial<Pick<ProjectMember, "id" | "userId" | "projectId">>;

const ProjectMemberModal = ({ id, onClose, onSave, userRole, projectId }: ProjectMemberModalProps) => {
  const [formData, setFormData] = useState<ProjectMemberForm>({});
  const [users, setUsers] = useState<User[]>([]);
  const token = Cookies.get("sempoa");

  // Load dropdown users (and existing member if editing)
  useEffect(() => {
    const run = async () => {
      try {
        const [usersRes, memberRes] = await Promise.all([
          axiosInstance.get(`/users`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
          id ? axiosInstance.get(`/project-members/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined }) : Promise.resolve(null),
        ]);

        setUsers(usersRes.data?.data ?? usersRes.data ?? []);

        if (memberRes) {
          const m = memberRes.data?.data ?? memberRes.data;
          setFormData({
            id: m.id,
            userId: m.userId ?? m.user?.id,
            projectId: m.projectId ?? m.project?.id ?? projectId,
          });
        } else {
          // initialize for create
          setFormData(prev => ({ ...prev, projectId }));
        }
      } catch (e) {
        console.error("Failed to fetch modal data", e);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, projectId]); // avoid token in deps to prevent refetch loops

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isCreate = !formData.id;
    const payload: ProjectMemberForm = {
      ...formData,
      ...(isCreate ? { projectId } : {}), // ensure projectId on create
    };

    // Pass the correct type to the parent
    onSave(payload as unknown as ProjectMember);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded shadow-lg w-8/12">
        <h2 className="text-xl font-bold mb-4">Add Project Member</h2>

        <form onSubmit={handleSubmit}>

          {/* User */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">User</label>
            <select
              name="userId"
              value={formData.userId ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email ?? u.id}
                </option>
              ))}
            </select>
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

export default ProjectMemberModal;