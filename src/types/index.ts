export interface ScholarshipSearchParams {
  caste: string;
  religion: string;
  state?: string;
  educationLevel?: string;
}

export interface Scholarship {
  title: string;
  institution: string;
  description: string;
  eligibility: string;
  amount?: string;
  deadline?: string;
  applicationLink?: string;
  requirements?: string[];
  selectionProcess?: string;
  background?: string;
}

export interface AdditionalResource {
  title: string;
  description: string;
  link: string;
}

export interface ScholarshipResponse {
  scholarships: Scholarship[];
  summary: string;
  recommendations?: string[];
  additionalResources?: AdditionalResource[];
  error?: string;
  details?: string;
}
