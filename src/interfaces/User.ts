export default interface UserObj {
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