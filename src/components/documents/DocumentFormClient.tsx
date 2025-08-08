'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Document } from '@/interfaces/Document';
import ProjectField from '@/interfaces/ProjectField';
import { Button } from '@/components/ui/button';

interface Props {
  fields: ProjectField[];
  initialData?: Partial<Document>;
}

export default function DocumentFormClient({ fields, initialData = {} }: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Log fields for debug
  useEffect(() => {
    console.log('Received fields from server:', fields);
  }, [fields]);

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = async (formValues: any) => {
    const documentField: Record<string, string> = {};
    fields.forEach((field) => {
      console.log(`field: ${JSON.stringify(field)}`);
      documentField[field.fieldCode] = formValues[field.fieldCode];
    });

    const payload = {
      ...initialData,
      ...formValues,
      documentField,
    };

    console.log('Submit Payload:', payload);

    // TODO: Replace with real API call
    router.push('/documents');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">
        {initialData?.id ? 'Supersede Document' : 'Upload Document'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Document Code */}
        <div>
          <label className="block font-medium mb-1">Document Code</label>
          <input
            {...register('docCode', { required: true })}
            className="input w-full"
            disabled={!!initialData?.id}
          />
          {errors.docCode && <span className="text-red-500 text-sm">Required</span>}
        </div>

        {/* Dynamic Project Fields */}
        {fields
          .filter((f) => f.fieldCode !== 'docCode')
          .map((field) => (
            <div key={field.fieldCode}>
              <label className="block font-medium mb-1">
                {field.fieldText} {field.mandatory && '*'}
              </label>

              {field.type === 'text' || field.type === 'number' || field.type === 'textarea' ? (
                field.type === 'textarea' ? (
                  <textarea
                    {...register(field.fieldCode, { required: field.mandatory })}
                    className="textarea w-full"
                  />
                ) : (
                  <input
                    type={field.type}
                    {...register(field.fieldCode, { required: field.mandatory })}
                    className="input w-full"
                  />
                )
              ) : field.type === 'select' && field.options ? (
                <select
                  {...register(field.fieldCode, { required: field.mandatory })}
                  className="select w-full"
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

        {/* File ID Field */}
        <div>
          <label className="block font-medium mb-1">File ID</label>
          <input
            {...register('fileId', { required: true })}
            className="input w-full"
          />
          {errors.fileId && <span className="text-red-500 text-sm">Required</span>}
        </div>

        {/* Type */}
        <div>
          <label className="block font-medium mb-1">Type</label>
          <input {...register('type')} className="input w-full" />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" onClick={() => router.back()} variant="ghost">
            Cancel
          </Button>
          <Button type="submit">{initialData?.id ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </div>
  );
}