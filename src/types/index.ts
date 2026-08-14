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
