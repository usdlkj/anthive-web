"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation"; // Next 13+ app router
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axios";

type Project = { id: string; name?: string; projectName?: string; code?: string };
type ProjectMember = { id: string; project: Project };

interface Props {
  /** Current project id from user profile (nullable) */
  value?: string | null;
  /** Optional preloaded projects (skip fetch if present & non-empty) */
  preloadProjects?: Project[];
  /** API to fetch project memberships */
  fetchUrl?: string; // default: "/projects/my"
  /** API to update current project id */
  updateUrl?: string; // default: "/users/me/current-project"
  /** Allow clearing selection (sets currentProjectId=null) */
  allowClear?: boolean;
  className?: string;
}

export default function CurrentProjectSelect({
  value = null,
  preloadProjects,
  fetchUrl = "/projects/my",
  updateUrl = "/users/me/current-project",
  allowClear = false,
  className = "",
}: Props) {
  const router = useRouter();
  const token = Cookies.get("sempoa");

  const hasPreloaded = Array.isArray(preloadProjects) && preloadProjects.length > 0;

  const [projects, setProjects] = useState<Project[]>(preloadProjects ?? []);
  const [selected, setSelected] = useState<string>(value ?? "");
  const [loading, setLoading] = useState(!hasPreloaded);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // keep selected in sync if parent updates currentProjectId later
  useEffect(() => {
    setSelected(value ?? "");
  }, [value]);

  // fetch projects on first mount if not provided
  useEffect(() => {
    if (hasPreloaded) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get(fetchUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const memberships: ProjectMember[] = res?.data?.data ?? res?.data ?? [];
        const list = memberships.map((m) => m.project);
        if (!cancelled) setProjects(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message ?? e?.message ?? "Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // depend on stable inputs only
  }, [fetchUrl, token, hasPreloaded]);

  const projectLabel = (p: Project) => p.projectName ?? p.name ?? p.code ?? p.id;

  const options = useMemo(
    () => projects.slice().sort((a, b) => projectLabel(a).localeCompare(projectLabel(b))),
    [projects]
  );

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value; // "" means clear
    setSelected(next);
    const prev = selected;

    try {
      setSaving(true);
      setError(null);

      await axiosInstance.patch(
        updateUrl,
        { currentProjectId: next || null },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      // redirect after successful set
      router.push("/dashboard");
    } catch (e: any) {
      setSelected(prev); // rollback
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to update current project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-gray-700">Current Project</label>

      <div className="relative">
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          value={selected}
          onChange={handleChange}
          disabled={loading || saving}
          aria-label="Select current project"
        >
          {allowClear && <option value="">— No project —</option>}

          {loading ? (
            <option value="">Loading projects…</option>
          ) : options.length ? (
            options.map((p) => (
              <option key={p.id} value={p.id}>
                {projectLabel(p)}{p.code ? ` (${p.code})` : ""}
              </option>
            ))
          ) : (
            <option value="">No projects available</option>
          )}
        </select>

        {saving && (
          <span className="absolute right-3 top-2.5 text-xs text-gray-500">Saving…</span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-gray-500">
          {loading ? "Fetching your projects…" : "Pick a project to set it, then you’ll be redirected."}
        </p>
      )}
    </div>
  );
}