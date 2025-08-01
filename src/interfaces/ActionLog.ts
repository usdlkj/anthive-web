

export interface ActionLog {
  id: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  meta: Record<string, any> | null;
  timestamp: string; // ISO string from the backend
}