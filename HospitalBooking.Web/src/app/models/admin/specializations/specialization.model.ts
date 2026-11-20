export type SpecializationStatus = 'Active' | 'Inactive';

export interface Specialization {
  id: number;
  name: string;
  description: string | null;
  status: SpecializationStatus;
  doctorsCount: number;
}

export interface CreateSpecializationRequest {
  name: string;
  description: string | null;
  status: SpecializationStatus;
}

export interface UpdateSpecializationRequest {
  name?: string;
  description?: string | null;
  status?: SpecializationStatus;
}
