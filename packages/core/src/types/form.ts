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

export type FormStep = {
  id: string;
  title: string;
  description?: string;
};
