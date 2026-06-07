import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      // Don't show toast for 404 - let component handle it
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 422) {
      toast.error('Invalid data. Please check your inputs.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
    }

    return Promise.reject(error);
  }
);

// ==================== API TYPES ====================

export interface Person {
  final_person_id: string;
  name: string;
  sex: string;
  birth_year: number;
  state: string;
  district: string;
  police_station: string;
  tracing_status: string;
  image_file: string;
}

export interface Case {
  id: string;
  case_id: string;
  final_person_id: string;
  name: string;
  age: number;
  gender: string;
  sex: string;
  birth_year: number;
  state: string;
  district: string;
  police_station: string;
  last_seen_location: string;
  last_seen_date: string;
  reported_date: string;
  status: 'submitted' | 'verified' | 'under-review' | 'matched' | 'closed';
  tracing_status: string;
  reporter_name: string;
  reporter_phone: string;
  reporter_email?: string;
  description?: string;
  photo_url?: string;
  image_file?: string;
  match_confidence?: number;
}

export interface SearchMatch {
  FinalPersonId: string;
  score: number;
  name: string;
  sex: string;
  birth_year: number;
  state: string;
  district: string;
  police_station: string;
  tracing_status: string;
  image_file: string;
}

export interface CasesResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: Person[];
}

export interface CaseResponse {
  success: boolean;
  data: Person;
}

export interface SearchResponse {
  success: boolean;
  matches: SearchMatch[];
  message?: string;
}

export interface UploadPhotoResponse {
  success: boolean;
  message: string;
}

export interface RegisterFaceResponse {
  success: boolean;
  FinalPersonId?: string;
  message: string;
}

export interface ReportMissingResponse {
  success: boolean;
  case_id: string;
}

// ==================== API FUNCTIONS ====================

// Health Check
export const healthCheck = async () => {
  const response = await api.get('/');
  return response.data;
};

// ==================== AUTH APIs ====================

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: 'citizen' | 'police' | 'admin';
  name: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append('username', email); // OAuth2 expects 'username'
  formData.append('password', password);

  const response = await api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const register = async (userData: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  photo?: File | null;
}): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append('first_name', userData.first_name);
  formData.append('last_name', userData.last_name);
  formData.append('email', userData.email);
  formData.append('phone', userData.phone);
  formData.append('password', userData.password);
  formData.append('role', userData.role || 'citizen');

  if (userData.photo) {
    formData.append('photo', userData.photo);
  }

  const response = await api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export interface DashboardStats {
  total_cases: number;
  traced: number;
  untraced: number;
  matched: number;
  case_status_distribution: { [key: string]: number };
  yearly_activity: { month: string; cases: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data.stats;
};

// ==================== ADMIN APIs ====================

export interface User {
  id: number; // Backend returns integer ID
  first_name: string;
  last_name: string;
  email: string;
  role: 'citizen' | 'police' | 'admin';
  is_verified: boolean;
  created_at: string;
}

export const getUsers = async (filters?: { role?: string; verified?: boolean }): Promise<User[]> => {
  const response = await api.get('/admin/users', { params: filters });
  return response.data;
};

export const getSystemActivity = async (): Promise<{
  title: string;
  description: string;
  status: string;
  date: string;
  case_id: string;
  case_name: string;
}[]> => {
  const response = await api.get('/admin/activity');
  return response.data;
};

export const getPendingPolice = async (): Promise<User[]> => {
  const response = await api.get('/admin/users', {
    params: { role: 'police', verified: false }
  });
  return response.data;
};

export const verifyUser = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/admin/users/${userId}/verify`);
  return response.data;
};

export const updateUserRole = async (userId: number, role: 'citizen' | 'police' | 'admin'): Promise<{ success: boolean; message: string }> => {
  const response = await api.put(`/admin/users/${userId}/role`, null, {
    params: { role }
  });
  return response.data;
};

export const createAdmin = async (userData: any): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('first_name', userData.first_name);
  formData.append('last_name', userData.last_name);
  formData.append('email', userData.email);
  formData.append('password', userData.password);

  const response = await api.post('/admin/create-admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const flagPotentialMatch = async (caseId: string, file: File): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/cases/${caseId}/flag-match`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Match Review APIs
export interface MatchReview {
  id: number;
  case_id: string;
  submitted_image: string;
  status: string;
  created_at: string;
  case_name: string;
  case_image: string;
  location: string;
}

export const getPotentialMatches = async (): Promise<MatchReview[]> => {
  const response = await api.get('/admin/potential-matches');
  return response.data;
};

export const confirmMatch = async (matchId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/admin/matches/${matchId}/confirm`);
  return response.data;
};

export const rejectMatch = async (matchId: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/admin/matches/${matchId}/reject`);
  return response.data;
};

// ==================== CASE APIs ====================

// Get all cases with pagination and filters
export const getCases = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  status?: string;
  gender?: string;
  mine?: boolean;
}): Promise<{ cases: Case[], total: number }> => {
  const response = await api.get('/cases', { params });
  const data = response.data as CasesResponse;

  // Transform Person[] to Case[]
  const cases = data.data.map(person => ({
    id: person.final_person_id,
    case_id: person.final_person_id,
    final_person_id: person.final_person_id,
    name: person.name,
    age: new Date().getFullYear() - person.birth_year,
    gender: person.sex === 'M' ? 'Male' : person.sex === 'F' ? 'Female' : 'Other',
    sex: person.sex,
    birth_year: person.birth_year,
    state: person.state,
    district: person.district,
    police_station: person.police_station,
    last_seen_location: `${person.district}, ${person.state}`,
    last_seen_date: 'Unknown',
    reported_date: new Date().toISOString().split('T')[0],
    status: mapTracingStatus(person.tracing_status),
    tracing_status: person.tracing_status,
    reporter_name: 'Anonymous',
    reporter_phone: 'N/A',
    image_file: person.image_file,
    photo_url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/uploads/${person.image_file || `${person.final_person_id}.jpg`}`,
  }));

  return { cases, total: data.total };
};

// Get case by ID
export const getCaseById = async (caseId: string): Promise<Case> => {
  const response = await api.get(`/cases/${caseId}`);
  const data = response.data as CaseResponse;
  const person = data.data;

  return {
    id: person.final_person_id,
    case_id: person.final_person_id,
    final_person_id: person.final_person_id,
    name: person.name,
    age: new Date().getFullYear() - person.birth_year,
    gender: person.sex === 'M' ? 'Male' : person.sex === 'F' ? 'Female' : 'Other',
    sex: person.sex,
    birth_year: person.birth_year,
    state: person.state,
    district: person.district,
    police_station: person.police_station,
    last_seen_location: `${person.district}, ${person.state}`,
    last_seen_date: 'Unknown',
    reported_date: new Date().toISOString().split('T')[0],
    status: mapTracingStatus(person.tracing_status),
    tracing_status: person.tracing_status,
    reporter_name: 'Anonymous',
    reporter_phone: 'N/A',
    image_file: person.image_file,
    photo_url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/uploads/${person.image_file || `${person.final_person_id}.jpg`}`,
  };
};

// Helper to map tracing_status to frontend status
function mapTracingStatus(tracingStatus: string): Case['status'] {
  const statusMap: Record<string, Case['status']> = {
    'missing': 'submitted',
    'Untraced': 'submitted',
    'Traced': 'matched',
    'verified': 'verified',
    'under-review': 'under-review',
    'closed': 'closed',
  };
  return statusMap[tracingStatus] || 'submitted';
}

// ==================== FACE SEARCH APIs ====================

// Upload photo (validate face only)
export const uploadPhoto = async (file: File): Promise<{ success: boolean; url?: string; filename?: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = response.data as UploadPhotoResponse;

  if (!data.success) {
    throw new Error(data.message);
  }

  // Return a temporary URL for the uploaded file
  return {
    success: true,
    url: URL.createObjectURL(file),
    filename: file.name,
  };
};

// Register face (for new missing person cases)
export const registerFace = async (
  file: File,
  metadata: {
    name: string;
    sex: string;
    birth_year: number;
    state: string;
    district: string;
    police_station: string;
  }
): Promise<RegisterFaceResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/register-face', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: metadata,
  });

  return response.data as RegisterFaceResponse;
};

// Search face
export const searchFace = async (file: File): Promise<{ results: SearchMatch[]; search_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/search', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: { top: 5 },
  });

  const data = response.data as SearchResponse;

  return {
    results: data.matches || [],
    search_id: `search_${Date.now()}`,
  };
};

// ==================== REPORT MISSING APIs ====================

export interface ReportMissingData {
  name: string;
  gender: string;
  birth_year: number;
  state: string;
  district: string;
  police_station: string;
  photo: File;
}

// Report missing person
export const reportMissing = async (data: ReportMissingData): Promise<{ case_id: string; message: string }> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('gender', data.gender);
  formData.append('birth_year', data.birth_year.toString());
  formData.append('state', data.state);
  formData.append('district', data.district);
  formData.append('police_station', data.police_station);
  formData.append('photo', data.photo);

  const response = await api.post('/report/missing', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const result = response.data as ReportMissingResponse;

  return {
    case_id: result.case_id,
    message: 'Case reported successfully',
  };
};

// ==================== PERSON APIs ====================

// Get all persons (alias for getCases)
export const getPersons = async (): Promise<Person[]> => {
  const response = await api.get('/persons');
  const data = response.data as CasesResponse;
  return data.data;
};

// ==================== NOTIFICATION APIs ====================

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'update' | 'match' | 'alert';
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data.notifications;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const updateCaseStatus = async (caseId: string, status: string): Promise<void> => {
  await api.put(`/cases/${caseId}/status`, { status });
};

export interface TimelineEvent {
  title: string;
  description: string;
  status: string;
  date: string;
}

export const getCaseTimeline = async (caseId: string): Promise<TimelineEvent[]> => {
  const response = await api.get(`/cases/${caseId}/timeline`);
  return response.data.timeline;
};

export default api;
