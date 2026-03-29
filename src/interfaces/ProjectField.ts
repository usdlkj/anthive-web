export interface ProjectField {
  id: string
  fieldCode: string
  fieldText: string
  visible: boolean
  mandatory: boolean
  sequence: number
  projectId: string
  isSystem: boolean
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox'
  options?: string[]
}
