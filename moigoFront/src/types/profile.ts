export interface ProfileData {
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'male' | 'female';
  bio: string;
  profileImage?: string;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'male' | 'female';
  bio: string;
} 