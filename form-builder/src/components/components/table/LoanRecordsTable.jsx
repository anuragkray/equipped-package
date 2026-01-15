import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchModuleRecords, fetchModuleFilterFields } from '../../services/moduleRecordsApi';
import { getKeytoSearchModuleData } from '../../utils/index.js';
import DataContainer from '../dataContainer/DataContainer';
import Loader from '../loader/Loader';
import DataNotFound from '../dataNotFound/DataNotFound';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import PaginationFooter from './PaginationFooter';
import FilterPopup from './filter/FilterPopup';
import SideModal from '../custom/modal/SideModal';
import ColumnSelection from './ColumnSelection';
import Card from '../custom/card/index.jsx';
import Button from '../ui/button/Button';
import { Plus, MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import { FilterCloseType } from './filter/index.jsx';
import { alertInfo } from '../../utils/alert.jsx';
import '../../modules/dynamicModule/DynamicModuleList.css';

const hideColumns = ['_id', 'kill', 'formId', 'connectionId', 'Owner', 'status'];

// Status Pill Component
const StatusPill = ({ status, type = 'risk' }) => {
  const getStatusConfig = () => {
    // Safely convert status to string and normalize
    const statusStr = status != null ? String(status) : '';
    const normalized = statusStr.toLowerCase();
    
    if (type === 'risk') {
      const riskMap = {
        'low': { color: '#10b981', bg: '#d1fae5', label: 'Low' },
        'medium': { color: '#f59e0b', bg: '#fef3c7', label: 'Medium' },
        'high': { color: '#ef4444', bg: '#fee2e2', label: 'High' },
      };
      return riskMap[normalized] || riskMap['low'];
    } else {
      const covenantMap = {
        'ok': { color: '#10b981', bg: '#d1fae5', label: 'OK' },
        'breach': { color: '#ef4444', bg: '#fee2e2', label: 'Breach' },
        'warning': { color: '#ef4444', bg: '#fee2e2', label: 'Warning' },
      };
      return covenantMap[normalized] || covenantMap['ok'];
    }
  };

  const config = getStatusConfig();
  
  return (
    <span
      className="status-pill"
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
};

const LoanRecordsTable = ({ moduleName = 'loan-onboarding', title = 'Loan Portfolio', onNewLoan }) => {
  const navigate = useNavigate();
  // Normalize module name for API calls - API expects 'loanonboarding' without hyphen
  const normalizedModuleName = (moduleName || 'loan-onboarding').toLowerCase().replace(/-/g, '');
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ offset: 1, limit: 25, total: 0 });
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  const [filterFields, setFilterFields] = useState({});
  const [appliedFilters, setAppliedFilters] = useState([]); // Array of filterObj objects, not object
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterFieldsLoading, setFilterFieldsLoading] = useState(false);
  const [modifyingFields, setModifyingFields] = useState({});
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [sortedBy, setSortedBy] = useState(null);
  const searchTimeoutRef = useRef(null);

  const cloneFields = useCallback((value) => {
    if (!value) return value;
    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    }
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (err) {
      return value;
    }
  }, []);

  const dataRows = useMemo(() => {
    if (!records) return [];
    
    // Extract data rows from response - check common response formats
    if (Array.isArray(records)) {
      return records;
    }
    
    // Check for module-specific data key (e.g., loanOnboardingData)
    const moduleKey1 = `${normalizedModuleName}Data`;
    const moduleKey2 = `${normalizedModuleName}Data`;
    const moduleKey3 = `${normalizedModuleName}Data`;
    
    if (records[moduleKey1] && Array.isArray(records[moduleKey1])) {
      return records[moduleKey1];
    }
    if (records[moduleKey2] && Array.isArray(records[moduleKey2])) {
      return records[moduleKey2];
    }
    if (records[moduleKey3] && Array.isArray(records[moduleKey3])) {
      return records[moduleKey3];
    }
    
    // Check for generic 'data' key
    if (records.data && Array.isArray(records.data)) {
      return records.data;
    }
    
    // Check for 'records' key
    if (records.records && Array.isArray(records.records)) {
      return records.records;
    }
    
    // Check if records is an object with array values
    if (typeof records === 'object') {
      for (const key in records) {
        if (Array.isArray(records[key]) && records[key].length > 0) {
          // Check if it's not pagination
          if (key !== 'pagination' && !key.toLowerCase().includes('pagination')) {
            return records[key];
          }
        }
      }
    }
    
    return [];
  }, [records, normalizedModuleName]);

  const paginationInfo = useMemo(() => {
    if (!records) return { offset: 1, limit: 25, total: 0 };
    
    // Check for pagination in response
    if (records.pagination) {
      return {
        offset: records.pagination.offset || pagination.offset,
        limit: records.pagination.limit || pagination.limit,
        total: records.pagination.total || 0,
      };
    }
    
    return pagination;
  }, [records, pagination]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      // Reset to first page when search changes
      setPagination(prev => ({ ...prev, offset: 1 }));
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]);

  // Fetch filter fields on mount (same as MinervaLMS)
  useEffect(() => {
    const loadFilterFields = async () => {
      if (!normalizedModuleName) return;
      setFilterFieldsLoading(true);
      try {
        const response = await fetchModuleFilterFields(normalizedModuleName);
        if (response?.statusCode === 200 && response?.data) {
          // Data is already mapped to object with field name as key (from fetchModuleFilterFields)
          const fieldsObj = response.data;
          setFilterFields(fieldsObj);
          setModifyingFields(cloneFields(fieldsObj));
        } else {
          setFilterFields({});
        }
      } catch (err) {
        setFilterFields({});
      } finally {
        setFilterFieldsLoading(false);
      }
    };

    loadFilterFields();
  }, [normalizedModuleName]);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        // Format search according to MinervaLMS pattern
        // Use getKeytoSearchModuleData to get the correct field name (e.g., "loanonboardingName")
        const searchField = getKeytoSearchModuleData(normalizedModuleName);
        const search = debouncedSearchValue.trim()
          ? [
              {
                field: searchField, // e.g., "loanonboardingName" instead of "loan-onboarding"
                data: debouncedSearchValue.trim(),
                filter: 'REGEX',
                type: '',
              },
            ]
          : [];

        // Convert applied filters to search array format (same as MinervaLMS)
        const filterSearch = [];
        appliedFilters.forEach(filterObj => {
          if (filterObj && filterObj.filter && filterObj.field) {
            if (filterObj.filter === 'BETWEEN' && filterObj.data && typeof filterObj.data === 'object') {
              // Handle BETWEEN filter - split into two conditions
              if (filterObj.data.from !== null && filterObj.data.from !== undefined && filterObj.data.from !== '') {
                filterSearch.push({
                  field: filterObj.field,
                  data: filterObj.data.from,
                  filter: 'GREATER_THAN_OR_EQUAL',
                  type: filterObj.type || '',
                });
              }
              if (filterObj.data.to !== null && filterObj.data.to !== undefined && filterObj.data.to !== '') {
                filterSearch.push({
                  field: filterObj.field,
                  data: filterObj.data.to,
                  filter: 'LESS_THAN_OR_EQUAL',
                  type: filterObj.type || '',
                });
              }
            } else if (filterObj.filter !== 'BETWEEN') {
              // For non-BETWEEN filters, check if data is valid
              const hasValidData = filterObj.data !== null && 
                                  filterObj.data !== undefined && 
                                  filterObj.data !== '';
              
              if (hasValidData) {
                // For arrays and strings, check length
                if (Array.isArray(filterObj.data) || typeof filterObj.data === 'string') {
                  if (filterObj.data.length > 0) {
                    filterSearch.push({
                      field: filterObj.field,
                      data: filterObj.data,
                      filter: filterObj.filter,
                      type: filterObj.type || '',
                    });
                  }
                } else {
                  // For numbers, booleans, dates, etc. - any value is valid
                  filterSearch.push({
                    field: filterObj.field,
                    data: filterObj.data,
                    filter: filterObj.filter,
                    type: filterObj.type || '',
                  });
                }
              }
            }
          }
        });

        const payload = {
          offset: pagination.offset,
          limit: pagination.limit,
          buttonType: 'All',
          search: [...search, ...filterSearch],
          ...(sortedBy?.key ? { sortBy: sortedBy } : {}),
        };
        
        // Add profile for loan onboarding
        if (normalizedModuleName === 'loanonboarding') {
          payload.profile = 'Administrator';
        }
        
        const response = await searchModuleRecords(normalizedModuleName, payload);
        
        if (response?.statusCode === 200 && response?.data) {
          setRecords(response.data);
          // Update pagination if available in response
          if (response.data.pagination) {
            setPagination(prev => ({
              ...prev,
              offset: response.data.pagination.offset || prev.offset,
              limit: response.data.pagination.limit || prev.limit,
              total: response.data.pagination.total || 0,
            }));
          }
        } else {
          setRecords(null);
        }
      } catch (err) {
        setRecords(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [normalizedModuleName, pagination.offset, pagination.limit, debouncedSearchValue, appliedFilters, sortedBy]);

  // Get all available columns from filterFields
  const allAvailableColumns = useMemo(() => {
    if (!filterFields || Object.keys(filterFields).length === 0) {
      // Fallback to data rows if filterFields not available
      if (!dataRows || !dataRows.length) return [];
      const firstRow = dataRows[0];
      if (!firstRow || typeof firstRow !== 'object') return [];
      return Object.keys(firstRow).filter(key => 
        !hideColumns.includes(key) && 
        key !== '__v' && 
        !key.startsWith('$')
      ).map(key => ({
        name: key,
        label: key,
      }));
    }
    // Get columns from filterFields
    return Object.values(filterFields).map(field => ({
      name: field.name,
      label: field.label || field.fieldLabel || field.name,
      type: field.type || field.fieldType || 'text',
    }));
  }, [filterFields, dataRows]);

  // Load column order from localStorage on mount
  useEffect(() => {
    if (normalizedModuleName) {
      const savedOrder = localStorage.getItem(`columnOrder_${normalizedModuleName}`);
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setColumnOrder(parsed);
          }
        } catch (err) {
        }
      }
    }
  }, [normalizedModuleName]);

  // Define table columns - filter based on selected columns and apply order
  const tableColumns = useMemo(() => {
    // First, try to get columns from filterFields (always available)
    let allKeys = [];
    if (filterFields && Object.keys(filterFields).length > 0) {
      allKeys = Object.keys(filterFields).filter(key => 
        !hideColumns.includes(key) && 
        key !== '__v' && 
        !key.startsWith('$')
      );
    }
    
    // Fallback to data rows if filterFields not available
    if (allKeys.length === 0 && dataRows && dataRows.length > 0) {
      const firstRow = dataRows[0];
      if (firstRow && typeof firstRow === 'object') {
        allKeys = Object.keys(firstRow).filter(key => 
          !hideColumns.includes(key) && 
          key !== '__v' && 
          !key.startsWith('$')
        );
      }
    }
    
    // If still no keys, return empty (but this should rarely happen)
    if (allKeys.length === 0) return [];
    
    // Filter keys based on selected columns
    let keysToShow = allKeys;
    if (selectedColumns && selectedColumns.length > 0) {
      keysToShow = allKeys.filter(key => selectedColumns.includes(key));
    } else if (allKeys.length > 0) {
      // Default: show first 5 columns if nothing selected
      keysToShow = allKeys.slice(0, 5);
    }
    
    // Apply column order if available
    let orderedKeys = keysToShow;
    if (columnOrder.length > 0) {
      // Sort keys based on saved order, keeping any new columns at the end
      const orderedSet = new Set(columnOrder);
      const ordered = columnOrder.filter(key => keysToShow.includes(key));
      const unordered = keysToShow.filter(key => !orderedSet.has(key));
      orderedKeys = [...ordered, ...unordered];
    }
    
    // Format columns to match TableHeader/TableRow API
    return orderedKeys.map(key => {
      // Try to get label from filterFields
      const fieldInfo = filterFields[key];
      const label = (fieldInfo?.label || fieldInfo?.fieldLabel || 
        key.replace(/([A-Z])/g, ' $1').trim()
      ).toUpperCase(); // Convert to uppercase
      
      return {
        name: key,
        key: key,
        label: label,
      };
    });
  }, [dataRows, selectedColumns, filterFields, columnOrder]);

  // Handle column reordering
  const handleColumnReorder = useCallback((fromIndex, toIndex) => {
    setColumnOrder(prevOrder => {
      // Compute current keys based on filterFields and selectedColumns
      let allKeys = [];
      if (filterFields && Object.keys(filterFields).length > 0) {
        allKeys = Object.keys(filterFields).filter(key => 
          !hideColumns.includes(key) && 
          key !== '__v' && 
          !key.startsWith('$')
        );
      } else if (dataRows && dataRows.length > 0) {
        const firstRow = dataRows[0];
        if (firstRow && typeof firstRow === 'object') {
          allKeys = Object.keys(firstRow).filter(key => 
            !hideColumns.includes(key) && 
            key !== '__v' && 
            !key.startsWith('$')
          );
        }
      }
      
      if (allKeys.length === 0) return prevOrder;
      
      // Filter keys based on selected columns
      let keysToShow = allKeys;
      if (selectedColumns && selectedColumns.length > 0) {
        keysToShow = allKeys.filter(key => selectedColumns.includes(key));
      } else if (allKeys.length > 0) {
        keysToShow = allKeys.slice(0, 5);
      }
      
      // Apply current order if available
      let currentKeys = keysToShow;
      if (prevOrder.length > 0) {
        const orderedSet = new Set(prevOrder);
        const ordered = prevOrder.filter(key => keysToShow.includes(key));
        const unordered = keysToShow.filter(key => !orderedSet.has(key));
        currentKeys = [...ordered, ...unordered];
      }
      
      // Reorder the keys
      const newKeys = [...currentKeys];
      const [moved] = newKeys.splice(fromIndex, 1);
      newKeys.splice(toIndex, 0, moved);
      
      // Save new order to localStorage
      if (normalizedModuleName) {
        localStorage.setItem(`columnOrder_${normalizedModuleName}`, JSON.stringify(newKeys));
      }
      
      return newKeys;
    });
  }, [normalizedModuleName, filterFields, dataRows, selectedColumns]);

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const handleLimitChange = (newLimit, newOffset) => {
    setPagination({ limit: newLimit, offset: newOffset, total: pagination.total });
  };

  const handleRowClick = (item) => {
    // Navigate to the loan onboarding detail page
    const recordId = item?._id || item?.id;
    if (recordId) {
      navigate(`/loan-onboarding/detail/${recordId}`);
    }
  };

  const handleView = (e, item) => {
    e.stopPropagation();
    // Navigate to the loan onboarding detail page
    const recordId = item?._id || item?.id;
    if (recordId) {
      navigate(`/loan-onboarding/detail/${recordId}`);
    }
  };

  const handleFlag = (e, item) => {
    e.stopPropagation();
    // Handle flag action
    alertInfo('Flag functionality will be implemented', 'Coming Soon');
  };

  const handleFilters = () => {
    setIsFilterModalOpen(true);
  };

  useEffect(() => {
    if (Object.keys(filterFields).length > 0) {
      setModifyingFields(cloneFields(filterFields));
    }
  }, [filterFields, cloneFields]);

  const handleSort = (sortObj) => {
    setSortedBy(sortObj);
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, offset: 1 }));
  };

  // Validate and extract filters (same as MinervaLMS)
  const getValidatedFilters = useCallback((fields) => {
    const allValidatedFilters = {};
    const appliedValidatedFilters = [];
    Object.keys(fields).forEach(key => {
      const element = fields[key];
      if (element && element.filterObj) {
        const f = element.filterObj;
        // Validate filter - same logic as MinervaLMS
        // Check if filter and data are valid
        let isValid = f.filter && f.data !== null && f.data !== undefined;
        
        if (isValid) {
          // For BETWEEN filter, check if it's an object with from/to
          if (f.filter === 'BETWEEN') {
            if (typeof f.data === 'object' && f.data !== null) {
              // BETWEEN is valid if at least one of from or to has a value
              isValid = (f.data.from !== null && f.data.from !== undefined && f.data.from !== '') ||
                       (f.data.to !== null && f.data.to !== undefined && f.data.to !== '');
            } else {
              isValid = false;
            }
          } else {
            // For non-BETWEEN filters, check if data is not empty
            if (Array.isArray(f.data) || typeof f.data === 'string') {
              isValid = f.data.length > 0;
            }
            // For numbers, booleans, etc., any value is valid (including 0, false)
          }
        }
        
        if (!isValid) {
          delete element.filterObj;
        }
      }
      if (element && element.filterObj) {
        appliedValidatedFilters.push(element.filterObj);
      }
      allValidatedFilters[key] = element;
    });
    return { allValidatedFilters, appliedValidatedFilters };
  }, []);

  const handleApplyFilters = (fieldsToApply = null) => {
    const filtersToApply = fieldsToApply || modifyingFields;
    const { allValidatedFilters, appliedValidatedFilters } = getValidatedFilters(filtersToApply);
    setFilterFields(allValidatedFilters);
    setAppliedFilters(appliedValidatedFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, offset: 1 }));
  };

  const handleClearFilters = () => {
    const allFilters = { ...modifyingFields };
    Object.keys(allFilters)?.forEach(key => {
      if (allFilters[key]) {
        delete allFilters[key].filterObj;
      }
    });
    setModifyingFields(allFilters);
    setFilterFields(allFilters);
    setAppliedFilters([]);
    // Reset to first page when filters are cleared
    setPagination(prev => ({ ...prev, offset: 1 }));
  };

  const appliedFiltersCount = useMemo(() => {
    return appliedFilters.length;
  }, [appliedFilters]);

  const handleNewLoan = () => {
    // Navigate to form view with ?mode=create to create new record
    const targetUrl = `/modules/${moduleName || 'loan-onboarding'}?mode=create`;
    navigate(targetUrl, { replace: true });
    
    // If parent provides callback, use it
    if (onNewLoan && typeof onNewLoan === 'function') {
      onNewLoan();
    }
  };

  const isDataPresent = Array.isArray(dataRows) && dataRows.length > 0;

  return (
    <div className="dynamic-module-list-container">
      <div className="dynamic-module-list-header">
        <h2 className="dynamic-module-list-title">
          {title}
        </h2>
        <Button onClick={handleNewLoan} className="dynamic-module-list-new-btn">
          <Plus size={16} style={{ marginRight: '4px' }} />
          New Loan Application
        </Button>
      </div>

      <Card className="dynamic-module-list-card">
        <div className="dynamic-module-list-toolbar">
          <div className="dynamic-module-list-search">
            <MagnifyingGlass size={20} className="dynamic-module-list-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="dynamic-module-list-search-input"
            />
          </div>
          <div className="dynamic-module-list-actions">
            <ColumnSelection 
              moduleName={normalizedModuleName}
              allColumns={allAvailableColumns}
              selectedColumns={selectedColumns}
              onColumnsChange={setSelectedColumns}
            />
          <Button 
              onClick={handleFilters}
            className="dynamic-module-list-new-btn"
          >
            <Funnel size={16} weight={appliedFiltersCount > 0 ? 'fill' : 'regular'} style={{ marginRight: '4px' }} />
            Filters {appliedFiltersCount > 0 && `(${appliedFiltersCount})`}
          </Button> 
        </div>
      </div>

        <div className="dynamic-module-list-table-container" style={{ display: 'block' }}>
        <DataContainer
          loading={loading}
          isDataPresent={isDataPresent}
          loaderElement={
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <table className="dynamic-module-list-table" style={{ display: 'table', width: '100%' }}>
                  {tableColumns.length > 0 && (
                <TableHeader 
                  columns={tableColumns}
                  filterFields={filterFields}
                  sortedBy={sortedBy}
                  onSort={handleSort}
                  onFilterApply={handleApplyFilters}
                  setModifyingFields={setModifyingFields}
                  modifyingFields={modifyingFields}
                      onColumnReorder={handleColumnReorder}
                />
                  )}
              </table>
              <Loader className="flex-1" />
            </div>
          }
          notFoundElement={
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <table className="dynamic-module-list-table" style={{ display: 'table', width: '100%' }}>
                  {tableColumns.length > 0 && (
                <TableHeader 
                  columns={tableColumns}
                  filterFields={filterFields}
                  sortedBy={sortedBy}
                  onSort={handleSort}
                  onFilterApply={handleApplyFilters}
                  setModifyingFields={setModifyingFields}
                  modifyingFields={modifyingFields}
                      onColumnReorder={handleColumnReorder}
                />
                  )}
              </table>
              <DataNotFound className="flex-1" />
            </div>
          }
        >
            <table className="dynamic-module-list-table" style={{ display: 'table', width: '100%' }}>
              {tableColumns.length > 0 ? (
                <>
            <TableHeader 
              columns={tableColumns}
              filterFields={filterFields}
              sortedBy={sortedBy}
              onSort={handleSort}
              onFilterApply={handleApplyFilters}
              setModifyingFields={setModifyingFields}
              modifyingFields={modifyingFields}
              onColumnReorder={handleColumnReorder}
            />
            <tbody>
                    {dataRows?.map((item, index) => (
                <TableRow
                        key={item?._id || item?.id || index}
                  item={item}
                  columns={tableColumns}
                  rowAction={handleRowClick}
                  onView={handleView}
                  onFlag={handleFlag}
                  StatusPill={StatusPill}
                />
              ))}
            </tbody>
                </>
              ) : dataRows && dataRows.length > 0 ? (
                // Fallback: show table with default columns if tableColumns is empty but dataRows exist
                <>
                  <thead>
                    <tr>
                      {Object.keys(dataRows[0] || {}).slice(0, 10).map(key => (
                        <th key={key} className="px-2 pr-4 whitespace-nowrap py-3 font-[400]">
                          {key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.map((item, index) => (
                      <tr key={item?._id || item?.id || index}>
                        {Object.keys(dataRows[0] || {}).slice(0, 10).map(key => (
                          <td key={key} className="px-2 pr-4 py-3">
                            {item[key] !== null && item[key] !== undefined ? String(item[key]) : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : null}
          </table>
        </DataContainer>
      </div>

        {paginationInfo.total > 0 && (
        <PaginationFooter
            offset={paginationInfo.offset}
            limit={paginationInfo.limit}
          total={paginationInfo.total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}
      </Card>

      {/* Filter Modal */}
      <SideModal isOpen={isFilterModalOpen} onClose={() => {
        setModifyingFields(cloneFields(filterFields));
        setIsFilterModalOpen(false);
      }} width="275px">
        <DataContainer loading={filterFieldsLoading} isDataPresent={Object.keys(filterFields).length > 0}>
          <FilterPopup 
            fields={modifyingFields} 
            setFields={setModifyingFields} 
            handleClose={(type) => {
              if (type === FilterCloseType.ON_APPLY_CLOSE) {
                // Apply filters when Apply button is clicked - use current modifyingFields
                handleApplyFilters();
              } else if (type === FilterCloseType.ON_NORMAL_CLOSE) {
                // Reset to original fields when closed without applying
                setModifyingFields(cloneFields(filterFields));
              }
              setIsFilterModalOpen(false);
            }} 
          />
        </DataContainer>
      </SideModal>
    </div>
  );
};

export default LoanRecordsTable;
