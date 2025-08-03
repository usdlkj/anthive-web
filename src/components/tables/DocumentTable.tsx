import { useMemo } from 'react';
import { Document } from '@/types/document';
import { ProjectField } from '@/types/project';
import { Table } from '@/components/ui/table'; // your reusable table, or use `react-table`
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
  // Limit to 5 non-system fields, sorted by sequence
  const dynamicFields = useMemo(() => {
    return projectFields
      .filter((f) => f.fieldCode !== 'docCode')
      .sort((a, b) => a.sequence - b.sequence)
      .slice(0, 5);
  }, [projectFields]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Doc Code</th>
            <th className="px-4 py-2 border">Version</th>
            <th className="px-4 py-2 border">Status</th>
            {dynamicFields.map((field) => (
              <th key={field.fieldCode} className="px-4 py-2 border">
                {field.fieldText}
              </th>
            ))}
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{doc.docCode}</td>
              <td className="px-4 py-2 border">{doc.version}</td>
              <td className="px-4 py-2 border">{doc.status}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};
