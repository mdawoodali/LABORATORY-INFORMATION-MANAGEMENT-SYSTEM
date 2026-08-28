const fs = require('fs');

const path = 'src/app/invoice/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update initial state and add updateLabel
code = code.replace(/const \[formData, setFormData\] = useState\(\{[\s\S]*?discountPercent: 0,\s*\}\);/, 
`const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: '',
    customerName: '',
    companyAddress: '',
    responsiblePerson: '',
    contactDetail: '',
    email: '',
    ntn: '',
    otherInformation: '',
    discountPercent: 0,
    fieldLabels: {
      customerName: 'Applicant Name',
      companyAddress: 'Company Address',
      responsiblePerson: 'Contact Person',
      contactDetail: 'Contact detail',
      email: 'Email',
      ntn: 'NTN #',
      otherInformation: 'Other Information',
      test: 'Test Name',
      method: 'Test Method',
      price: 'PRICE (PKR)',
      samples: 'No of sample'
    } as Record<string, string>
  });

  const updateLabel = (field: string, newLabel: string) => {
    setFormData(prev => ({
      ...prev,
      fieldLabels: {
        ...(prev.fieldLabels || {
          customerName: 'Applicant Name',
          companyAddress: 'Company Address',
          responsiblePerson: 'Contact Person',
          contactDetail: 'Contact detail',
          email: 'Email',
          ntn: 'NTN #',
          otherInformation: 'Other Information',
          test: 'Test Name',
          method: 'Test Method',
          price: 'PRICE (PKR)',
          samples: 'No of sample'
        }),
        [field]: newLabel
      }
    }));
  };`);

// 2. Update the load logic
code = code.replace(/setFormData\(data\.data\.formData\);/, 
`setFormData(prev => ({ 
              ...prev, 
              ...data.data.formData, 
              fieldLabels: { 
                ...(prev.fieldLabels || {}), 
                ...(data.data.formData.fieldLabels || {}) 
              } 
            }));`);

// 3. Update the forceSaveOption calls
code = code.replace(/forceSaveOption\('inv_customerName', formData\.customerName\);/, "forceSaveOption(formData.fieldLabels?.customerName || 'Applicant Name', formData.customerName);");
code = code.replace(/forceSaveOption\('inv_companyAddress', formData\.companyAddress\);/, "forceSaveOption(formData.fieldLabels?.companyAddress || 'Company Address', formData.companyAddress);");
code = code.replace(/forceSaveOption\('inv_responsiblePerson', formData\.responsiblePerson\);/, "forceSaveOption(formData.fieldLabels?.responsiblePerson || 'Contact Person', formData.responsiblePerson);");
code = code.replace(/forceSaveOption\('inv_contactDetail', formData\.contactDetail\);/, "forceSaveOption(formData.fieldLabels?.contactDetail || 'Contact detail', formData.contactDetail);");
code = code.replace(/forceSaveOption\('inv_email', formData\.email\);/, "forceSaveOption(formData.fieldLabels?.email || 'Email', formData.email);");
code = code.replace(/forceSaveOption\('inv_ntn', formData\.ntn\);/, "forceSaveOption(formData.fieldLabels?.ntn || 'NTN #', formData.ntn);");
code = code.replace(/forceSaveOption\('inv_otherInformation', formData\.otherInformation\);/, "forceSaveOption(formData.fieldLabels?.otherInformation || 'Other Information', formData.otherInformation);");

code = code.replace(/forceSaveOption\('inv_item_test', item\.test\);/, "forceSaveOption(formData.fieldLabels?.test || 'Test Name', item.test);");
code = code.replace(/forceSaveOption\('inv_item_method', item\.method\);/, "forceSaveOption(formData.fieldLabels?.method || 'Test Method', item.method);");
code = code.replace(/forceSaveOption\('inv_item_price', item\.price\);/, "if (item.price !== '') forceSaveOption(formData.fieldLabels?.price || 'PRICE (PKR)', item.price);");
code = code.replace(/forceSaveOption\('inv_item_samples', item\.samples\);/, "if (item.samples !== '') forceSaveOption(formData.fieldLabels?.samples || 'No of sample', item.samples);");

fs.writeFileSync(path, code);
console.log('Fixed invoice state');
