/** A 1–3 rating, used for both Postings (from the backend) and Motivation (from the user). */
export type Score = 1 | 2 | 3;

export interface Company {
  id: string;
  name: string;
  industry: string;
  /** True when the candidate's university has alumni working at this company. */
  hasAlumni: boolean;
  /** How strongly the company is currently hiring for the target role. */
  postingsScore: Score;
  /** How much the candidate wants to work here. Editable by the user. */
  motivationScore: Score;
}

/** Input collected by the /looking/setup form. */
export interface GenerateCompaniesParams {
  university: string;
  targetRole: string;
  dreamCompanies: string[];
}
