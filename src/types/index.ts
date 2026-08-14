export interface TestRow {
  id: string;
  test: string;
  unit: string;
  standard: string;
  result: string;
}

export interface ReportFormData {
  reportNo: string;
  applicant: string;
  address: string;
  phone: string;
  sampleDescription: string;
  sample: string;
  shape: string;
  sampleDate: string;
  orderNo: string;
  color: string;
  size: string;
  fabricConstruction: string;
  fabricWeight: string;
  fibreContent: string;
  endUse: string;
  buyerName: string;
  buyingHouse: string;
  manufacturer: string;
  previousReportNo: string;
  sampleReceivingDate: string;
  sampleReportingDate: string;
  careLabelSymbols: string;
  sampleDetails: string;
  tableHeader1: string;
  tableHeader2: string;
  tableHeader3: string;
  tableHeader4: string;
  footerText: string;
}

export interface Template {
  id: string;
  name: string;
  formData: ReportFormData;
  tests: TestRow[];
  createdAt: string;
  fileData?: string; // Base64 of the uploaded DOCX file
  thumbnail?: string; // Base64 of the thumbnail image
}

export interface SavedReport {
  id: string;
  reportNo: string;
  applicant: string;
  date: string;
  password: string;
  data: {
    formData: ReportFormData;
    tests: TestRow[];
    sampleImage: string | null;
  };
}

export interface AppSettings {
  autoBackup: boolean;
  defaultPassword: string;
  companyName: string;
  backupLocation: string;
  signatureImage?: string;
}

export const DEFAULT_FORM_DATA: ReportFormData = {
  reportNo: '',
  applicant: '',
  address: '',
  phone: '',
  sampleDescription: '',
  sample: '',
  shape: '',
  sampleDate: '',
  orderNo: '',
  color: '',
  size: '',
  fabricConstruction: '',
  fabricWeight: '',
  fibreContent: '',
  endUse: '',
  buyerName: '',
  buyingHouse: '',
  manufacturer: '',
  previousReportNo: '',
  sampleReceivingDate: '',
  sampleReportingDate: '',
  careLabelSymbols: '',
  sampleDetails: '',
  tableHeader1: 'Test',
  tableHeader2: 'Unit',
  tableHeader3: 'ASTM Standard',
  tableHeader4: 'Actual Results',
  footerText: 'Average readings are reported.'
};

export const DEFAULT_TESTS: TestRow[] = [
  { id: '1', test: 'New Test', unit: '-', standard: '-', result: '-' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  autoBackup: true,
  defaultPassword: '1234',
  companyName: 'S. R. Laboratories',
  backupLocation: 'Supabase Cloud',
};
