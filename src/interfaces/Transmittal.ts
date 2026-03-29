export type RecipientType = 'to' | 'cc' | 'bcc'
export type TransmittalStatus = 'draft' | 'sent'

export interface TransmittalUser {
  id: string
  name: string
  email: string
  companyId: string
}

export interface TransmittalCompany {
  id: string
  companyName: string
  companyCode: string
}

export interface TransmittalRecipient {
  id: string
  recipientType: RecipientType
  recipientUserId?: string
  recipientUser?: TransmittalUser
  companyId: string
  company?: TransmittalCompany
}

export interface TransmittalItem {
  id: string
  sourceDocumentId: string
  recipientCompanyId: string
  recipientDocumentId: string
}

export interface TransmittalType {
  id: string
  projectId: string
  typeCode: string
  typeName: string
}

export interface Transmittal {
  id: string
  projectId: string
  transmittalTypeId?: string
  transmittalType?: TransmittalType
  transmittalCode: string
  subject: string
  message?: string
  status: TransmittalStatus
  createdAt: string
  sentAt?: string
  senderUserId: string
  senderCompanyId: string
  recipients: TransmittalRecipient[]
  items: TransmittalItem[]
  draftSourceDocumentIds: string[]
}
