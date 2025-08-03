import { Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { ProjectField } from '@/types/project';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  projectFields: ProjectField[];
  initialData?: Partial<Document>;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectFields,
  initialData = {},
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = (formValues: any) => {
    const documentField: Record<string, string> = {};
    projectFields.forEach((field) => {
      documentField[field.fieldCode] = formValues[field.fieldCode];
    });

    const payload = {
      ...initialData,
      ...formValues,
      documentField,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white p-6 rounded shadow-lg w-full max-w-lg space-y-4">
          <Dialog.Title className="text-lg font-semibold">
            {initialData?.id ? 'Edit Document' : 'Create Document'}
          </Dialog.Title>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Doc Code is mandatory and typically shown */}
            <div>
              <label className="block font-medium mb-1">Document Code</label>
              <input
                {...register('docCode', { required: true })}
                className="input w-full"
                disabled={!!initialData?.id} // disable when editing
              />
              {errors.docCode && <span className="text-red-500 text-sm">Required</span>}
            </div>

            {/* Dynamic Project Fields */}
            {projectFields
              .filter((f) => f.fieldCode !== 'docCode') // docCode handled separately
              .map((field) => (
                <div key={field.fieldCode}>
                  <label className="block font-medium mb-1">
                    {field.fieldText} {field.mandatory && '*'}
                  </label>

                  {field.type === 'text' || field.type === 'number' || field.type === 'textarea' ? (
                    field.type === 'textarea' ? (
                      <textarea
                        {...register(field.fieldCode, {
                          required: field.mandatory,
                        })}
                        className="textarea w-full"
                      />
                    ) : (
                      <input
                        type={field.type}
                        {...register(field.fieldCode, {
                          required: field.mandatory,
                        })}
                        className="input w-full"
                      />
                    )
                  ) : field.type === 'select' && field.options ? (
                    <select
                      {...register(field.fieldCode, {
                        required: field.mandatory,
                      })}
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
              <input
                {...register('type')}
                className="input w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button type="submit">{initialData?.id ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
