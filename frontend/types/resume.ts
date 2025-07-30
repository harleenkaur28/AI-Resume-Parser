export interface Skill {
  skill_name: string;
  percentage: number;
}

export interface Language {
  language: string;
}

export interface Education {
  education_detail: string;
}

export interface WorkExperience {
  role: string;
  company_and_duration: string;
  bullet_points: string[];
}

export interface Project {
  title: string;
  technologies_used: string[];
  description: string;
}

export interface Publication {
  title: string;
  authors?: string;
  journal_conference?: string;
  year?: string;
  doi?: string;
  url?: string;
}

export interface PositionOfResponsibility {
  title: string;
  organization: string;
  duration?: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  url?: string;
}

export interface Achievement {
  title: string;
  description?: string;
  year?: string;
  category?: string;
}

export interface ResumeData {
  skills_analysis: Skill[];
  recommended_roles: string[];
  languages: Language[];
  education: Education[];
  work_experience: WorkExperience[];
  projects: Project[];
  publications: Publication[];
  positions_of_responsibility: PositionOfResponsibility[];
  certifications: Certification[];
  achievements: Achievement[];
  name: string;
  email: string;
  contact: string;
  predicted_field: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: ResumeData;
  cleaned_text: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

export interface PdfGenerationRequest {
  resumeData: ResumeData;
  template?: string;
  options?: {
    fontSize?: number;
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    colorScheme?: 'default' | 'blue' | 'green' | 'red';
  };
}
