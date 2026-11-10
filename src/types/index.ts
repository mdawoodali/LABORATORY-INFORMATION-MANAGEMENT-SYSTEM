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
  criteria?: string;
  criteriaUnit?: string;
  result: string;
}

export interface ExtraPage {
  id: string;
  image: string | null;
  text: string;
}

export type ReportStatus = 'Received' | 'In Testing' | 'Draft' | 'Reviewed' | 'Approved' | 'Dispatched';

export const REPORT_STATUS_CONFIG: Record<ReportStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  'Received': { label: 'Sample Received', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
  'In Testing': { label: 'In Testing', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  'Draft': { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-400' },
  'Reviewed': { label: 'Reviewed', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' },
  'Approved': { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  'Dispatched': { label: 'Dispatched', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300', dot: 'bg-teal-500' },
};

export interface ReportFormData {
  dynamicFields?: DynamicField[];
  status?: ReportStatus;
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
  buyerName: string;
  buyingHouse: string;
  manufacturer: string;
  previousReportNo: string;
  reportDate?: string;
  sampleReceivingDate: string;
  sampleReportingDate: string;
  careLabelSymbols: string;
  sampleDetails: string;
  remarks?: string;
  tableHeader1: string;
  tableHeader2: string;
  tableHeader3: string;
  tableHeader4: string;
  tableHeader5: string;
  tableHeader6?: string;
  tableHeader7?: string;
  tableLayout?: '7-col' | '5-col';
  footerText: string;
}

export function is7ColumnReport(data?: Partial<ReportFormData>, tests?: TestRow[]): boolean {
  if (!data) return false;
  if (data.tableLayout === '7-col') return true;
  if (data.tableLayout === '5-col') return false;
  if (data.tableHeader6 !== undefined || data.tableHeader7 !== undefined) return true;
  if (tests && tests.some(t => t.criteria !== undefined || t.criteriaUnit !== undefined)) return true;
  return false;
}

export interface Template {
  id: string;
  name: string;
  formData: ReportFormData;
  tests: TestRow[];
  extraPages?: ExtraPage[];
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
    extraPages?: ExtraPage[];
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
  buyerName: '',
  buyingHouse: '',
  manufacturer: '',
  previousReportNo: '',
  reportDate: '',
  sampleReceivingDate: '',
  sampleReportingDate: '',
  careLabelSymbols: '',
  sampleDetails: '',
  tableHeader1: 'Test',
  tableHeader2: 'Test Method',
  tableHeader3: 'Value',
  tableHeader4: 'Unit',
  tableHeader5: 'Criteria',
  tableHeader6: 'Unit',
  tableHeader7: 'Result',
  tableLayout: '7-col',
  status: 'Approved',
  footerText: ''
};

export const DEFAULT_TESTS: TestRow[] = [
  { id: '1', test: '', method: '', value: '', unit: '', criteria: '', criteriaUnit: '', result: '' },
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
    { id: 'f15', label: 'BUYER NAME', value: data.buyerName || '' },
    { id: 'f16', label: 'BUYING HOUSE', value: data.buyingHouse || '' },
    { id: 'f17', label: 'MANUFACTURER', value: data.manufacturer || '' },
    { id: 'f18', label: 'PREVIOUS REPORT #', value: data.previousReportNo || '' },
    { id: 'f19', label: 'SAMPLE RECEIVING  DATE ', value: data.sampleReceivingDate || '' },
    { id: 'f20', label: 'SAMPLE REPORTING DATE', value: data.sampleReportingDate || '' },
    { id: 'f21', label: 'CARE LABEL SYMBOLS', value: data.careLabelSymbols || '' },
  ];
};

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    name: 'Garment Wash & Shrinkage Report',
    createdAt: new Date().toISOString(),
    tests: [
      { id: 't1', test: 'Dimensional Stability to Washing', method: 'AATCC 135', value: '-2.5%', unit: '%', criteria: '±3.0%', criteriaUnit: '%', result: 'Pass' },
      { id: 't2', test: 'Appearance After Wash', method: 'Visual', value: 'No significant change', unit: 'Rating', criteria: 'Min 4', criteriaUnit: 'Grade', result: 'Pass' }
    ],
    formData: {
      ...DEFAULT_FORM_DATA,
      reportNo: 'TPL-WASH-01',
      dynamicFields: [
        { id: 'f1', label: 'APPLICANT', value: 'ABC Garments Ltd', bold: true },
        { id: 'f2', label: 'ADDRESS', value: '123 Textile Ave' },
        { id: 'f21', label: 'CARE LABEL SYMBOLS', value: 'Machine Wash Cold' },
      ]
    }
  },
  {
    id: 'tpl-2',
    name: 'Color Fastness Certificate',
    createdAt: new Date().toISOString(),
    tests: [
      { id: 't1', test: 'Color Fastness to Dry Rubbing', method: 'ISO 105-X12', value: '4-5', unit: 'Grade', criteria: 'Min 4', criteriaUnit: 'Grade', result: 'Pass' },
      { id: 't2', test: 'Color Fastness to Wet Rubbing', method: 'ISO 105-X12', value: '3-4', unit: 'Grade', criteria: 'Min 3', criteriaUnit: 'Grade', result: 'Pass' },
      { id: 't3', test: 'Color Fastness to Washing', method: 'ISO 105-C06', value: '4', unit: 'Grade', criteria: 'Min 4', criteriaUnit: 'Grade', result: 'Pass' }
    ],
    formData: {
      ...DEFAULT_FORM_DATA,
      reportNo: 'TPL-COLOR-02',
      dynamicFields: [
        { id: 'f1', label: 'APPLICANT', value: 'XYZ Dyeing Mills', bold: true },
        { id: 'f9', label: 'COLOR', value: 'Navy Blue' },
        { id: 'f13', label: 'FIBRE CONTENT', value: 'Polyester/Cotton Blend' },
      ]
    }
  },
  {
    id: 'tpl-3',
    name: 'Testing Services Invoice',
    createdAt: new Date().toISOString(),
    tests: [
      { id: 't1', test: 'Color Fastness Test', method: '1 Set', value: '$45.00', unit: 'USD', result: '$45.00' },
      { id: 't2', test: 'Shrinkage Test', method: '2 Sets', value: '$30.00', unit: 'USD', result: '$60.00' },
      { id: 't3', test: 'Total Amount Due', method: '', value: '', unit: '', result: '$105.00' }
    ],
    formData: {
      ...DEFAULT_FORM_DATA,
      reportNo: 'INV-2026-001',
      tableHeader1: 'Description',
      tableHeader2: 'Quantity',
      tableHeader3: 'Unit Price',
      tableHeader4: 'Currency',
      tableHeader5: 'Total',
      dynamicFields: [
        { id: 'f1', label: 'CLIENT NAME', value: 'Global Fashion Brands', bold: true },
        { id: 'f2', label: 'BILLING ADDRESS', value: '456 Retail Blvd' },
        { id: 'f3', label: 'INVOICE DATE', value: new Date().toLocaleDateString() },
        { id: 'f4', label: 'PAYMENT TERMS', value: 'Net 30 Days' },
      ]
    }
  }
];
