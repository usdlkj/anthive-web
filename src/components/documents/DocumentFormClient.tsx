'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Document } from '@/interfaces/Document';
import ProjectField from '@/interfaces/ProjectField';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import Cookies from 'js-cookie';

interface Props {
  fields: ProjectField[];
  initialData?: Partial<Document>;
}

export default function DocumentFormClient({ fields, initialData = {} }: Props) {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name?: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Log fields for debug
  useEffect(() => {
  }, [fields]);

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const token = Cookies.get('sempoa');
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const form = new FormData();
      form.append('file', file);
      // Note: axiosInstance likely prefixes /api; keep endpoint consistent with axiosInstance usage for /documents
      const res = await axiosInstance.post('/file', form, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Let the browser set the multipart boundary
        },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setUploadProgress(pct);
        },
      });
      // Support either { data: { id, ... } } or direct { id, ... }
      const payload = res?.data?.data ?? res?.data;
      const fileId = payload?.id ?? payload?.fileId;
      if (fileId) {
        setValue('fileId', fileId, { shouldValidate: true, shouldDirty: true });
        setUploadedFile({ id: fileId, name: file.name });
      } else {
        console.warn('Upload succeeded but no file id returned:', res?.data);
        alert('File uploaded, but no file ID was returned by the server.');
      }
    } catch (err: any) {
      console.error('File upload failed:', err?.response?.data ?? err?.message ?? err);
      alert(err?.response?.data?.message ?? err?.message ?? 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formValues: any) => {
    const token = Cookies.get('sempoa');
    setSubmitting(true);
    try {
      const documentField: Record<string, string> = {};
      fields.forEach((field) => {
        documentField[field.fieldCode] = formValues[field.fieldCode];
      });
    
      const payload = {
        ...initialData,
        ...formValues,
        documentField,
      };
    
      const res = await axiosInstance.post('/documents', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      router.push('/documents');
    } catch (e: any) {
      console.error('Failed to create document:', e?.response?.data ?? e?.message ?? e);
      alert(e?.response?.data?.message ?? e?.message ?? 'Failed to create document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-3 bg-white rounded">
      <h1 className="text-xl font-semibold mb-6 border-b-2 pb-2 text-gray-500">
        {initialData?.id ? 'Supersede Document' : 'Upload Document'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('projectId')} value={initialData.projectId} />
        {/* Document Code */}
        <div>
          <label className="block font-medium mb-3 text-gray-500">Document Code</label>
          <input
            {...register('docCode', { required: true })}
            className="input w-full border rounded px-3 py-1"
            disabled={!!initialData?.id}
          />
          {errors.docCode && <span className="text-red-500 text-sm">Required</span>}
        </div>

        {/* Dynamic Project Fields */}
        {fields
          .filter((f) => f.fieldCode !== 'docCode')
          .map((field) => (
            <div key={field.fieldCode}>
              <label className="block font-medium mb-1 text-gray-400">
                {field.fieldText} {field.mandatory && '*'}
              </label>

              {field.type === 'text' || field.type === 'number' || field.type === 'textarea' ? (
                field.type === 'textarea' ? (
                  <textarea
                    {...register(field.fieldCode, { required: field.mandatory })}
                    className="textarea w-full border rounded px-3 py-1"
                  />
                ) : (
                  <input
                    type={field.type}
                    {...register(field.fieldCode, { required: field.mandatory })}
                    className="input w-full border rounded px-3 py-1"
                  />
                )
              ) : field.type === 'select' && field.options ? (
                <select
                  {...register(field.fieldCode, { required: field.mandatory })}
                  className="select w-full border rounded px-3 py-1"
                >
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  {...register(field.fieldCode)}
                  className="checkbox"
                />
              ) : null}

              {errors[field.fieldCode] && (
                <span className="text-red-500 text-sm">Required</span>
              )}
            </div>
          ))}

        {/* File (optional). Upload creates/returns a fileId; a document may or may not have a file. */}
        <div>
          <label className="block font-medium mb-1 text-gray-400">File (optional)</label>
          {/* Hidden input persists the selected fileId into the form values */}
          <input type="hidden" {...register('fileId', { required: false })} />
          <div className="flex items-center gap-3">
            <input
              type="file"
              onChange={handleFileSelected}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:hover:bg-blue-100"
              disabled={uploading || submitting}
            />
            {uploadedFile?.id ? (
              <button
                type="button"
                className="text-red-600 hover:text-red-700 text-sm"
                onClick={() => {
                  setUploadedFile(null);
                  setValue('fileId', '', { shouldDirty: true, shouldValidate: true });
                }}
                disabled={uploading || submitting}
              >
                Remove
              </button>
            ) : null}
          </div>
          {uploading ? (
            <div className="text-xs text-gray-500 mt-1">Uploading… {uploadProgress}%</div>
          ) : uploadedFile?.id ? (
            <div className="text-xs text-green-600 mt-1">
              Uploaded: {uploadedFile.name ?? uploadedFile.id} ({uploadedFile.id})
            </div>
          ) : (
            <div className="text-xs text-gray-400 mt-1">
              You can leave this empty. A document can be created without a file.
            </div>
          )}
          {errors.fileId && <span className="text-red-500 text-sm">Required</span>}
        </div>

        {/* Type */}
        <div>
          <label className="block font-medium mb-1 text-gray-400">Type</label>
          <input {...register('type')} className="input w-full border rounded px-3 py-1" />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" onClick={() => router.back()} variant="ghost">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : (initialData?.id ? 'Update' : 'Create')}</Button>
        </div>
      </form>
    </div>
  );
}