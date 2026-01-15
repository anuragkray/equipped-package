export const normalizeModuleName = (name = '') => 
  name.toString().toLowerCase().replace(/[\s-_]+/g, '');

export const STATIC_MODULES = [
  { _id: 'internal', moduleLabel: 'Internal Module', moduleIcon: '' },
  { _id: 'inventory', moduleLabel: 'Inventory', moduleIcon: '' },
];

// Helper function to recursively extract field names from inputs (including subsections)
export const extractFieldNames = (inputs) => {
  const names = [];
  if (!inputs || typeof inputs !== 'object') return names;
  
  Object.values(inputs).forEach(input => {
    if (!input) return;
    
    // If it's a SubSection, recursively extract fields from it
    if (input.type === 'SubSection' && input.inputs) {
      names.push(...extractFieldNames(input.inputs));
    } else if (input?.name) {
      // Regular field - add its name
      names.push(input.name);
    }
  });
  
  return names;
};
