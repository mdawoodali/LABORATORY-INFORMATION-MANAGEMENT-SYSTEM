export interface DynamicField {
  id: string;
  label: string;
  value: string;
  bold?: boolean;
}

export interface TestRow {
  id: string;
  test: string;
  method: string;
  value: string;
  unit: string;
  result: string;
}

export interface ReportFormData {
  dynamicFields?: DynamicField[];
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
  tableHeader5: string;
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
  tableHeader1: '',
  tableHeader2: '',
  tableHeader3: '',
  tableHeader4: '',
  tableHeader5: '',
  footerText: ''
};

export const DEFAULT_TESTS: TestRow[] = [
  { id: '1', test: '', method: '', value: '', unit: '', result: '' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  autoBackup: true,
  defaultPassword: '1234',
  companyName: 'L.I.M.S',
  backupLocation: 'Supabase Cloud',
};

export const migrateToDynamicFields = (data: ReportFormData): DynamicField[] => {
  if (data.dynamicFields && data.dynamicFields.length > 0) {
    return data.dynamicFields;
  }
  return [
    { id: 'f1', label: 'APPLICANT', value: data.applicant || '', bold: true },
    { id: 'f2', label: 'ADDRESS', value: data.address || '' },
    { id: 'f3', label: 'PHONE #', value: data.phone || '' },
    { id: 'f4', label: 'SAMPLE DESCRIPTION', value: data.sampleDescription || '' },
    { id: 'f5', label: 'SAMPLE', value: data.sample || '' },
    { id: 'f6', label: 'SHAPE', value: data.shape || '' },
    { id: 'f7', label: 'SAMPLE DATE', value: data.sampleDate || '' },
    { id: 'f8', label: 'ORDER NO.', value: data.orderNo || '' },
    { id: 'f9', label: 'COLOR', value: data.color || '' },
    { id: 'f10', label: 'SIZE', value: data.size || '' },
    { id: 'f11', label: 'FABRIC CONSTRUCTION', value: data.fabricConstruction || '' },
    { id: 'f12', label: 'FABRIC WEIGHT', value: data.fabricWeight || '' },
    { id: 'f13', label: 'FIBRE CONTENT', value: data.fibreContent || '' },
    { id: 'f14', label: 'END USE', value: data.endUse || '' },
    { id: 'f15', label: 'BUYER NAME', value: data.buyerName || '' },
    { id: 'f16', label: 'BUYING HOUSE', value: data.buyingHouse || '' },
    { id: 'f17', label: 'MANUFACTURER', value: data.manufacturer || '' },
    { id: 'f18', label: 'PREVIOUS REPORT #', value: data.previousReportNo || '' },
    { id: 'f19', label: 'SAMPLE RECEIVING  DATE ', value: data.sampleReceivingDate || '' },
    { id: 'f20', label: 'SAMPLE REPORTING DATE', value: data.sampleReportingDate || '' },
    { id: 'f21', label: 'CARE LABEL SYMBOLS', value: data.careLabelSymbols || '' },
  ];
};
