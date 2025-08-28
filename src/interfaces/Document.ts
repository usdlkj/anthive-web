export interface Document {
  id: string;
  docCode: string; // e.g. "X-DRAWING-001"
  companyId: string;
  companyName?: string;

  projectId: string;
  projectCode?: string;
  projectName?: string;

  fileId: string;
  fileName?: string;
  fileUrl?: string;

  type: string; // e.g. 'drawing', 'report'
  version: number;
  isLatest: boolean;

  parentId?: string;

  createdBy: string;
  updatedBy: string;
  deletedBy?: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  fieldMap?: Record<string, string>; // key-value map of custom fields
}
