export type FormFieldData = {
  [key: string]: string | string[] | number | boolean | null | object;
};

export type FormUpload = {
  field_id: string;
  urls: string[];
};

export type FormSubmissionData = {
  dados: FormFieldData;
  uploads: FormUpload[];
};

/** Step config (FormKit-compatible: id, title, fieldIds). */
export type FormStep = {
  id: string;
  title: string;
  /** Optional list of field ids in this step. When present, matches FormKit schema. */
  fieldIds?: string[];
  description?: string;
};
