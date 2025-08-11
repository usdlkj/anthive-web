// src/components/projects/CurrentProjectSelect.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axios";

type ProjectMember = {
  id: string;
  project: Project;
}

type Project = {
  id: string;
  projectName?: string;   // rename to match your API if different
  name?: string;          // fallback
  code?: string;
};

interface Props {
  /** The current selected project id (e.g., user.currentProjectId) */
  value?: string;
  /** Called after a successful change */
  onChanged?: (project: Project | null) => void;

  /** If you already have projects, pass them to skip fetching */
  preloadProjects?: Project[];

  /** API to fetch projects user belongs to (default: '/projects/my') */
  fetchUrl?: string;

  /** API to update current project (default: PATCH '/users/me/current-project') */
  updateUrl?: string;

  /** Allow clearing selection (sets currentProject to null) */
  allowClear?: boolean;

  /** Disabled state (e.g., while saving elsewhere) */
  disabled?: boolean;

  /** Optional className for container */
  className?: string;
}

export default function CurrentProjectSelect({
  value,
  onChanged,
  preloadProjects,
  fetchUrl = "/projects/my",
  updateUrl = "/users/me/current-project",
  allowClear = false,
  disabled = false,
  className = "",
}: Props) {
  const token = Cookies.get("sempoa");
  const [projects, setProjects] = useState<Project[]>(preloadProjects ?? []);
  const [loading, setLoading] = useState(!preloadProjects);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | "">(value ?? "");

  // derived name for display
  const projectLabel = (p: Project) =>
    p.projectName ?? p.name ?? p.code ?? p.id;

  useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  useEffect(() => {
    if (preloadProjects) return; // already provided
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(fetchUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        // Support either { data: [...] } or [...] response shapes
        const projectMembers: ProjectMember[] = res?.data?.data ?? res?.data ?? [];
        // assuming projectMembers: ProjectMember[]
        const list: Project[] = projectMembers.map((member) => member.project);
        if (!cancelled) setProjects(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchUrl, token, preloadProjects]);

  const options = useMemo(() => {
    const base = projects.slice().sort((a, b) => {
      const an = (projectLabel(a) || "").toLowerCase();
      const bn = (projectLabel(b) || "").toLowerCase();
      return an.localeCompare(bn);
    });
    return base;
  }, [projects]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value; // "" means clear
    setSelected(next);

    // Optimistic UI; revert on failure
    const prev = selected;
    try {
      setSaving(true);
      setError(null);

      // Send PATCH; adapt payload/route to your API
      // If allowClear and next === "", set to null on server.
      await axiosInstance.patch(
        updateUrl,
        { currentProjectId: next || null },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      const chosen = options.find((p) => p.id === next) ?? null;
      onChanged?.(chosen);
    } catch (e: any) {
      setSelected(prev); // rollback
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        Current Project
      </label>

      <div className="relative">
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          value={selected}
          onChange={handleChange}
          disabled={disabled || loading || saving}
          aria-label="Select current project"
        >
          {allowClear && <option value="">— No project —</option>}
          {loading ? (
            <option value="">Loading projects…</option>
          ) : options.length ? (
            options.map((p) => (
              <option key={p.id} value={p.id}>
                {projectLabel(p)}
                {p.code ? ` (${p.code})` : ""}
              </option>
            ))
          ) : (
            <option value="">No projects available</option>
          )}
        </select>

        {saving && (
          <span className="absolute right-3 top-2.5 text-xs text-gray-500">
            Saving…
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* helper text */}
      {!error && (
        <p className="text-xs text-gray-500">
          {loading
            ? "Fetching your projects…"
            : saving
            ? "Updating selection…"
            : "Select a project to set it as your current context."}
        </p>
      )}
    </div>
  );
}