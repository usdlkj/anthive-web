export default interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  lastLoginDate: string;
  status: string;
  companyId: string;
  currentProjectId?: string;
}