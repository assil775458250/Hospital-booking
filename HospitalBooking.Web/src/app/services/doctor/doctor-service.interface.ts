export interface DoctorProfile {
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

export interface DoctorServiceInterface {

  getDoctor(): DoctorProfile;

  updateDoctor(doctor: DoctorProfile): void;

}