'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Document } from '@/interfaces/Document';
import ProjectField from '@/interfaces/ProjectField';
import { DocumentTable } from '@/components/tables/DocumentTable';

interface Props {
  documents: Document[];
  projectFields: ProjectField[];
  userRole: string;
}

export default function DocumentTableClient({ documents, projectFields }: Props) {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  return (
    <DocumentTable
      documents={documents}
      projectFields={projectFields}
      onEdit={(doc) => setSelectedDoc(doc)}
      onView={(doc) => router.push(`/documents/${doc.id}`)}
    />
  );
}
