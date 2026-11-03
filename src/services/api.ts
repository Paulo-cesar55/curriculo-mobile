
import axios from "axios";

export interface Person {
  id: string | number;
  full_name: string;
  email: string;
  city?: string | null;
  state?: string | null;
  bio?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
}

export interface Project {
  id: number;
  title: string;
  description?: string | null;
  repository_url?: string | null;
  demo_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_featured: boolean;
}

export interface Skill {
  id: number;
  name: string;
  category?: string | null;
  proficiency_level?: string;
  years_experience?: number;
}

export interface Curriculum {
  person: Person;
  education: any[];
  experiences: any[];
  projects: Project[];
  skills: Skill[];
  certifications: any[];
}

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Buscar pessoas cadastradas
export async function getPersons(): Promise<Person[]> {
  const response = await api.get("/api/persons");
  return response.data;
}

// Buscar currículo completo
export async function getCurriculum(
  personId: string | number
): Promise<Curriculum> {
  const response = await api.get(
    `/api/persons/${personId}/curriculum`
  );

  return response.data;
}
