export interface Document {
  id: string
  docCode: string
  companyId: string
  projectId: string
  fileId?: string
  type: 'file' | 'folder'
  parentId?: string
  version: number
  isLatest: boolean
  isSuperseded: boolean
  isConfidential: boolean
  sourceDocumentId?: string
  receivedViaTransmittalId?: string
  createdBy: string
  deletedBy?: string
  createdAt: string
  deletedAt?: string
  fieldMap?: Record<string, string>
}
