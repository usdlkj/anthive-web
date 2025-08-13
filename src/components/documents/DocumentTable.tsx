import { useMemo } from 'react';
import { Document } from '@/interfaces/Document';
import ProjectField from '@/interfaces/ProjectField';
import { Table } from '../ui/table';
import { Pencil, Eye } from 'lucide-react';

interface DocumentTableProps {
  documents: Document[];
  projectFields: ProjectField[];
  onEdit?: (doc: Document) => void;
  onView?: (doc: Document) => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  projectFields,
  onEdit,
  onView,
}) => {
  const dynamicFields = useMemo(() => {
    return projectFields
      .filter((field) => field.visible)
      .sort((a, b) => a.sequence - b.sequence)
  }, [projectFields]);

  return (
    <div className="w-full bg-white rounded-lg p-2">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead className="bg-gray-100">
            <tr>
              {dynamicFields.map((field) => (
                <th key={field.fieldCode} className="px-4 py-2 border">
                  {field.fieldText}
                </th>
              ))}
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={dynamicFields.length + 1}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No documents uploaded yet
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  {dynamicFields.map((field) => (
                    <td key={field.fieldCode} className="px-4 py-2 border">
                      {doc.documentField?.[field.fieldCode] ?? <span className="text-gray-400">—</span>}
                    </td>
                  ))}
                  <td className="px-4 py-2 border">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      onClick={() => onView?.(doc)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800"
                      onClick={() => onEdit?.(doc)}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
