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

export interface DashboardStats {
  total_cases: number;
  traced: number;
  untraced: number;
  matched: number;
  case_status_distribution: {
    submitted: number;
    verified: number;
    under_review: number;
    matched: number;
    closed: number;
  };
  weekly_activity: {
    day: string;
    cases: number;
  }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data.stats;
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

export default api;
