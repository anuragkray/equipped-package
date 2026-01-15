import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FormJson } from "./inputlist/data";
import { genrateUID, generateUniqueInputName } from "../../../../utils/index.js";
import useParamsValue from "../../../../hooks/useParamsValue.js";
import { getFormByIdApi, getFormGroupApi, getFormByTitleApi, getFormApi } from "../../../../services/formApi.js";
import './FormBuilderCreatePage.css';
import { buildFormBuilderPath } from "../../formBuilderBasePath.js";
import FormBuilderPanels from "./components/FormBuilderPanels.jsx";
import {
  DEPENDENCY_SUPPORTED_TYPES,
  deepCloneInputs,
  getDefaultGridSize,
  normaliseFieldDependency,
  generateCamelCaseName,
  normaliseSubSectionInputs,
  normaliseSections,
} from "./utils/formBuilderCreateUtils.js";

const FormBuilder = () => {
  const [sections, setSections] = useState([]);
  const [draggedInput, setDraggedInput] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [selectItem, setSelectedItem] = useState(null);
  const [selectSection, setSelectSection] = useState(null);
  const [fromDetail, setFormDetail] = useState({ formTitle: '', formName: '', default: false });
  const { searchParams: { group, formId } } = useParamsValue();
  const { state } = useLocation() || {};
  const normalizedGroup = group || 'module';
  const [duplicateField, setDuplicateField] = useState({});
  const [swipeTargetId, setSwipeTargetId] = useState(null);
  const [hoveredSubSection, setHoveredSubSection] = useState(null);
  const [isDraggingFromInputList, setIsDraggingFromInputList] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const dropTargetRef = useRef(null); // Track drop target to prevent race conditions
  const isProcessingDrop = useRef(false); // Track if drop is being processed
  const subsectionDropProcessedRef = useRef(false); // Track if subsection drop was processed
  const isOverSubSectionRef = useRef(false); // Track if we're currently over a subsection during drag
  const [subSectionPropertiesModal, setSubSectionPropertiesModal] = useState({ isOpen: false, sectionIndex: null, subSectionId: null });
  const [tempSubSectionProps, setTempSubSectionProps] = useState(null); // Temporary state for subsection properties
  
  // Section Import Modal state
  const [sectionImportModal, setSectionImportModal] = useState({ isOpen: false, sectionIndex: null });
  const [sectionImportFormSections, setSectionImportFormSections] = useState([]);
  const [sectionImportLoading, setSectionImportLoading] = useState(false);
  const [selectedSectionImportModule, setSelectedSectionImportModule] = useState(null);
  
  // Delete confirmation modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ 
    isOpen: false, 
    type: '', // 'subSection' or 'field'
    label: '',
    sectionIndex: null, 
    inputKey: null, 
    subSectionId: null, 
    parentSubSectionId: null 
  });
  
  // Import from Module feature state
  const [importModuleEnabled, setImportModuleEnabled] = useState(false);
  const [importFormGroups, setImportFormGroups] = useState([]);
  const [importFormGroupsLoading, setImportFormGroupsLoading] = useState(false);
  const [selectedImportModule, setSelectedImportModule] = useState(null);
  // Sections from selected module's form
  const [formSections, setFormSections] = useState([]);
  const [formSectionsLoading, setFormSectionsLoading] = useState(false);
  
  // Auto-scroll during drag refs
  const autoScrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  // Auto-scroll configuration
  const SCROLL_THRESHOLD = 100; // Distance from edge to start scrolling (px)
  const SCROLL_SPEED = 15; // Pixels to scroll per frame
  
  // Auto-scroll function during drag
  const handleAutoScroll = (e) => {
    if (!isDraggingRef.current) return;
    
    const { clientY } = e;
    const viewportHeight = window.innerHeight;
    
    // Cancel any existing scroll animation
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
    }
    
    const scrollContainer = document.querySelector('.form-builder-wrapper') || document.documentElement;
    
    // Scroll up when near top
    if (clientY < SCROLL_THRESHOLD) {
      const scrollAmount = Math.max(1, (SCROLL_THRESHOLD - clientY) / SCROLL_THRESHOLD * SCROLL_SPEED);
      window.scrollBy({ top: -scrollAmount, behavior: 'auto' });
      autoScrollRef.current = requestAnimationFrame(() => handleAutoScroll(e));
    }
    // Scroll down when near bottom
    else if (clientY > viewportHeight - SCROLL_THRESHOLD) {
      const scrollAmount = Math.max(1, (clientY - (viewportHeight - SCROLL_THRESHOLD)) / SCROLL_THRESHOLD * SCROLL_SPEED);
      window.scrollBy({ top: scrollAmount, behavior: 'auto' });
      autoScrollRef.current = requestAnimationFrame(() => handleAutoScroll(e));
    }
  };
  
  // Start auto-scroll tracking
  const startDragAutoScroll = () => {
    isDraggingRef.current = true;
    document.addEventListener('drag', handleAutoScroll);
    document.addEventListener('dragover', handleAutoScroll);
  };
  
  // Stop auto-scroll tracking
  const stopDragAutoScroll = () => {
    isDraggingRef.current = false;
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
    document.removeEventListener('drag', handleAutoScroll);
    document.removeEventListener('dragover', handleAutoScroll);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDragAutoScroll();
    };
  }, []);

  useEffect(() => {
    if (formId) {
      setFormLoading(true);
      getFormByIdApi(formId)
        .then(response => {
          const formData = response?.data ?? response;
          setFormDetail({
            default: formData?.default,
            formTitle: normalizedGroup,
            formName: formData?.formName || ''
          });
          const incomingSections = formData?.sections || FormJson(normalizedGroup)?.sections || [];
          setSections(normaliseSections(incomingSections));
        })
        .catch(err => {
          setFormDetail({ formTitle: normalizedGroup, formName: '' });
          const defaultSections = FormJson(normalizedGroup)?.sections || [];
          setSections(normaliseSections(defaultSections));
        })
        .finally(() => {
          setFormLoading(false);
        });
    } else {
      setFormDetail({
        formTitle: normalizedGroup,
        formName: state?.formName || '',
        moduleLabel: state?.moduleLabel,
        moduleIcon: state?.moduleIcon
      });
      const defaultSections = FormJson(normalizedGroup)?.sections || [];
      setSections(normaliseSections(defaultSections));
    }
  }, [normalizedGroup, formId, state]);

  const handleInputDragStart = (e, input, key) => {
    // Deep clone the input to avoid sharing references (especially for options array)
    const clonedInput = JSON.parse(JSON.stringify(input));
    setDraggedInput({ ...clonedInput, id: key });
    setIsDraggingFromInputList(true);
    subsectionDropProcessedRef.current = false; // Reset flag on new drag
    dropTargetRef.current = null; // Reset drop target
    isOverSubSectionRef.current = false; // Reset subsection hover flag
    startDragAutoScroll(); // Start auto-scroll
  };

  const handleInputDragEnd = async (inputIs) => {
    // CRITICAL: This function ONLY handles SECTION drops
    // Subsection drops are handled by subsection's onDrop handler
    
    // IMMEDIATE SYNCHRONOUS CHECKS (before ANY async operations):
    // These checks must happen synchronously to catch subsection drops
    
    // Check 1: Is dropTargetRef set? (Most reliable - set synchronously on dragOver)
    const currentDropTarget = dropTargetRef.current;
    if (currentDropTarget && currentDropTarget.trim() !== '') {
      // We're dropping into subsection - exit immediately
      return;
    }
    
    // Check 2: Are we over subsection?
    if (isOverSubSectionRef.current) {
      return;
    }
    
    // Check 3: Was subsection drop already processed?
    if (subsectionDropProcessedRef.current) {
      return;
    }
    
    // Check 4: Is hoveredSubSection set? (Check state synchronously)
    const currentHoveredSubSection = hoveredSubSection;
    if (currentHoveredSubSection && currentHoveredSubSection.id) {
      return;
    }

    // Wait to let onDrop handlers fire first and set flags
    // This gives subsection's onDrop time to process and set flags
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check again after waiting (subsection's onDrop should have processed by now):
    if (subsectionDropProcessedRef.current) {
      return;
    }

    // Check dropTargetRef again (it should still be set if we're over subsection)
    if (dropTargetRef.current && dropTargetRef.current.trim() !== '') {
      return;
    }
    
    if (isOverSubSectionRef.current) {
      return;
    }
    
    // Check hoveredSubSection again
    if (hoveredSubSection && hoveredSubSection.id) {
      return;
    }

    if (isProcessingDrop.current) return;
    
    isProcessingDrop.current = true;

    try {
      // ONLY process SECTION drops from here
      if (!hoveredSection) {
        isProcessingDrop.current = false;
        return;
      }

      // FINAL CHECK: Make absolutely sure we're not dropping into subsection
      if (dropTargetRef.current || hoveredSubSection?.id || isOverSubSectionRef.current || subsectionDropProcessedRef.current) {
        isProcessingDrop.current = false;
        return;
      }

      const targetSection = hoveredSection;
      const currentSwipeTargetId = swipeTargetId;
      
      // CRITICAL: One more check before processing - verify we're not over subsection
      // This is the absolute final check before we add to section
      if (dropTargetRef.current || isOverSubSectionRef.current || subsectionDropProcessedRef.current || hoveredSubSection?.id) {
        isProcessingDrop.current = false;
        return;
      }

      // CRITICAL: Check if this input was already added to any subsection
      // This is a safety check - if we find an input with the same type and label
      // that was just added (has animationClass), it means subsection drop already processed it
      const inputType = inputIs?.type;
      const inputLabel = inputIs?.label || inputIs?.FieldLabel;
      const wasAddedToSubSection = sections.some(s => 
        Object.values(s.inputs || {}).some(input => {
          if (input?.type === 'SubSection' && input?.inputs) {
            return Object.values(input.inputs).some(subInput => 
              subInput?.type === inputType && 
              subInput?.label === inputLabel &&
              subInput?.animationClass === "animate-new-input"
            );
          }
          return false;
        })
      );
      
      if (wasAddedToSubSection) {
        // Input was already added to subsection, don't add to section
        isProcessingDrop.current = false;
        return;
      }

      // Normal drop into section - keep existing logic unchanged
      // CRITICAL: Deep clone the input to avoid reference sharing
      const clonedInputIs = JSON.parse(JSON.stringify(inputIs));
      
      let newUId = `item-${genrateUID()}`;
      const label = clonedInputIs?.label || clonedInputIs?.FieldLabel || clonedInputIs?.type || 'field';
      const uniqueName = generateUniqueInputName(label, sections, null);

      await setSelectedItem({
        ...clonedInputIs,
        id: newUId,
        name: uniqueName,
        label: label,
        gridSize:
          clonedInputIs?.gridSize ??
          getDefaultGridSize(clonedInputIs?.type || clonedInputIs?.FieldType),
        animationClass: "animate-new-input",
      });

      // Clear state
      setHoveredSection(null);
      setHoveredSubSection(null);
      setSwipeTargetId(null);
      setDraggedInput(null);
      setIsDraggingFromInputList(false);
      // CRITICAL: Clear all refs after processing section drop
      // This ensures next drag operation starts clean
      dropTargetRef.current = null;
      subsectionDropProcessedRef.current = false; // Also reset subsection flag
      isOverSubSectionRef.current = false; // Reset subsection hover flag

      let data = sections?.map(s => {
        if (s.id === targetSection?.id) {
          // FINAL SAFETY CHECK: Make absolutely sure we're not dropping into sub-section
          // This prevents accidentally adding to section when we meant to add to sub-section
          // Check if hoveredSubSection still exists (shouldn't, but double-check)
          if (hoveredSubSection?.id) {
            // If hoveredSubSection exists, we're dropping into sub-section - skip section processing
            return s; // Return unchanged - don't modify section
          }

          // Deep clone existing inputs to avoid reference issues
          const clonedInputs = deepCloneInputs(s.inputs || {});
          const inputKeys = Object.keys(clonedInputs);
          const regularInputKeys = inputKeys.filter(key => clonedInputs[key]?.type !== 'SubSection');
          const targetIndex = currentSwipeTargetId && regularInputKeys.includes(currentSwipeTargetId)
            ? regularInputKeys.indexOf(currentSwipeTargetId)
            : -1;
          const newInputs = {};
          setSelectSection(s);

          const newField = {
            ...clonedInputIs,
            id: newUId,
            name: uniqueName,
            label: label,
            gridSize:
              clonedInputIs?.gridSize ??
              getDefaultGridSize(clonedInputIs?.type || clonedInputIs?.FieldType),
            animationClass: "animate-new-input",
          };
          
          // Deep clone and regenerate option IDs to ensure uniqueness
          if (Array.isArray(newField.options)) {
            newField.options = newField.options.map(opt => ({ ...opt, id: genrateUID() }));
          }

          if (targetIndex === -1) {
            regularInputKeys.forEach(key => {
              newInputs[key] = clonedInputs[key];
            });
            newInputs[newUId] = newField;
            inputKeys.forEach(key => {
              if (clonedInputs[key]?.type === 'SubSection') {
                newInputs[key] = clonedInputs[key];
              }
            });
          } else {
            regularInputKeys.forEach((key, index) => {
              if (index === targetIndex) {
                newInputs[newUId] = newField;
              }
              newInputs[key] = clonedInputs[key];
            });
            inputKeys.forEach(key => {
              if (clonedInputs[key]?.type === 'SubSection') {
                newInputs[key] = clonedInputs[key];
              }
            });
          }

          // Return new object instead of mutating
          return { ...s, inputs: newInputs };
        }
        return s;
      });

      setSections(data);

      setTimeout(() => {
        setSections(prevSections =>
          prevSections.map(s => {
            if (s.id === targetSection?.id && s.inputs[newUId]) {
              const input = s.inputs[newUId];
              const type = input?.type;
              const updatedInput = {
                ...input,
                animationClass: "",
              };
                if (type === 'Select' || type === 'Multiselect' || type === 'radio') {
                updatedInput.options = [
                    { id: genrateUID(), label: "Option 1", value: "1" },
                  ];
                }
              return {
                ...s,
                inputs: {
                  ...s.inputs,
                  [newUId]: updatedInput
              }
              };
            }
            return s;
          })
        );
      }, 1000);
    } finally {
      isProcessingDrop.current = false;
      stopDragAutoScroll(); // Stop auto-scroll when drag ends
    }
  };

  const handleDragSectionInput = (inputKey, input, section, sourceSubSectionId = null) => {
    // Track where the input is being dragged from
    setDraggedInput({ ...input, id: inputKey, sourceSubSectionId, sourceSectionId: section?.id });
    setHoveredSection(section);
    setIsDraggingFromInputList(false);
    // CRITICAL: Clear refs when starting a new drag from existing field
    // This prevents interference from previous InputList drag operations
    dropTargetRef.current = null;
    isOverSubSectionRef.current = false;
    subsectionDropProcessedRef.current = false;
    startDragAutoScroll(); // Start auto-scroll for existing field drag
  };

  const handleDragSectionInputOver = (e, inputKey) => {
    e.preventDefault();
    // e.stopPropagation(); // Important: Prevent bubbling to section
    setSwipeTargetId(inputKey);
    if (draggedInput?.id === inputKey) {
      setSwipeTargetId(null);
    }
  };

  const handleDragOverSubSection = (e, section, subSectionId) => {
    e.preventDefault();
    e.stopPropagation(); // CRITICAL: Prevent section from handling this
    // CRITICAL: Also stop immediate propagation to prevent any parent handlers
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }

    // Handle dragging from InputList OR from existing fields (section/subsection)
    if (isDraggingFromInputList || draggedInput) {
      // CRITICAL: Only set refs for InputList drags (to prevent race conditions with handleInputDragEnd)
      // For existing field drags, we don't need refs - the state is sufficient
      if (isDraggingFromInputList) {
        dropTargetRef.current = subSectionId;
        isOverSubSectionRef.current = true;
      }
      
      // Set states for both InputList and existing field drags
      setHoveredSection(section);
      setHoveredSubSection({ id: subSectionId });
    }
  };

  const handleSwipeInputInsideSection = (sec, event, sourceSubSectionId = null) => {
    event.preventDefault();
    event.stopPropagation();

    // Skip if we're over a subsection - let subsection handler deal with it
    if (hoveredSubSection) {
      // SECTION SUBSECTION → SUBSECTION: When dragging an entire subsection into another, keep it as a nested block (not flattened)
      if (draggedInput?.type === 'SubSection' && hoveredSubSection?.id && draggedInput?.id !== hoveredSubSection.id) {
        const targetSubSectionId = hoveredSubSection.id;
        const targetSectionId = hoveredSection?.id;
        const sourceSectionId = sec?.id;
        const draggedSubSectionId = draggedInput.id;
        const draggedSubSection = draggedInput;

        const updatedSections = sections.map(s => {
          // Remove the dragged subsection from its source section
          if (s?.id === sourceSectionId) {
            const updatedInputs = { ...(s.inputs || {}) };
            delete updatedInputs[draggedSubSectionId];
            s = { ...s, inputs: updatedInputs };
          }

          // Append dragged subsection fields into target subsection
          if (s?.id === targetSectionId) {
            const targetSubSection = s.inputs?.[targetSubSectionId];
            if (targetSubSection && targetSubSection.type === 'SubSection') {
              s = {
                ...s,
                inputs: {
                  ...s.inputs,
                  [targetSubSectionId]: {
                    ...targetSubSection,
                    inputs: {
                      ...(targetSubSection.inputs || {}),
                      [draggedSubSectionId]: {
                        ...draggedSubSection,
                        animationClass: "swipe-animation",
                      }
                    }
                  }
                }
              };
            }
          }

          return s;
        });

        setSections(updatedSections);

        // Clear drag state
        setDraggedInput(null);
        setHoveredSection(null);
        setHoveredSubSection(null);
        setSwipeTargetId(null);
        setIsDraggingFromInputList(false);
        dropTargetRef.current = null;
        isOverSubSectionRef.current = false;
        subsectionDropProcessedRef.current = false;
        return;
      }

      // BUT if we're dragging FROM a section (not subsection) TO a subsection, handle it here
      if (draggedInput && !draggedInput.sourceSubSectionId && hoveredSubSection?.id) {
        // SECTION → SUBSECTION: Move input from section to subsection
        const targetSubSectionId = hoveredSubSection.id;
        const targetSectionId = hoveredSection?.id;
        const sourceSectionId = sec?.id;

        const updatedSections = sections.map((s) => {
          if (s?.id === sourceSectionId) {
            // Remove from source section
            const updatedInputs = { ...s.inputs };
            delete updatedInputs[draggedInput?.id];
            
            // If source and target are the same section, also add to subsection
            if (s?.id === targetSectionId) {
              const subSection = updatedInputs[targetSubSectionId];
              if (subSection && subSection.type === 'SubSection') {
                const { sourceSubSectionId: _, sourceSectionId: __, ...cleanedInput } = draggedInput;
                const newField = { ...cleanedInput, animationClass: "swipe-animation" };
                return {
                  ...s,
                  inputs: {
                    ...updatedInputs,
                    [targetSubSectionId]: {
                      ...subSection,
                      inputs: {
                        ...subSection.inputs,
                        [draggedInput.id]: newField
                      }
                    }
                  }
                };
              }
            }
            return { ...s, inputs: updatedInputs };
          } else if (s?.id === targetSectionId && sourceSectionId !== targetSectionId) {
            // Add to target subsection (different section)
            const subSection = s.inputs[targetSubSectionId];
            if (subSection && subSection.type === 'SubSection') {
              const { sourceSubSectionId: _, sourceSectionId: __, ...cleanedInput } = draggedInput;
              const newField = { ...cleanedInput, animationClass: "swipe-animation" };
              return {
                ...s,
                inputs: {
                  ...s.inputs,
                  [targetSubSectionId]: {
                    ...subSection,
                    inputs: {
                      ...subSection.inputs,
                      [draggedInput.id]: newField
                    }
                  }
                }
              };
            }
          }
          return s;
        });

        setSections(updatedSections);

        // Remove animation class after animation
        setTimeout(() => {
          setSections((prevSections) =>
            prevSections.map((s) => {
              if (s.id === targetSectionId) {
                const subSection = s.inputs[targetSubSectionId];
                if (subSection && subSection.inputs && subSection.inputs[draggedInput?.id]) {
                  return {
                    ...s,
                    inputs: {
                      ...s.inputs,
                      [targetSubSectionId]: {
                        ...subSection,
                        inputs: {
                          ...subSection.inputs,
                          [draggedInput.id]: {
                            ...subSection.inputs[draggedInput.id],
                            animationClass: ""
                          }
                        }
                      }
                    }
                  };
                }
              }
              return s;
            })
          );
        }, 500);
      }

      setDraggedInput(null);
      setHoveredSection(null);
      setHoveredSubSection(null);
      setSwipeTargetId(null);
      setIsDraggingFromInputList(false);
      // Clean up refs
      dropTargetRef.current = null;
      isOverSubSectionRef.current = false;
      subsectionDropProcessedRef.current = false;
      return;
    }

    // Check if dragged input is from a subsection and we're dropping into a section
    const isFromSubSection = draggedInput?.sourceSubSectionId;
    
    if (isFromSubSection && hoveredSection && !hoveredSubSection) {
      // SUBSECTION → SECTION: Move input from subsection to section
      const sourceSubSectionId = draggedInput.sourceSubSectionId;
      const sourceSectionId = draggedInput.sourceSectionId;
      const targetSectionId = hoveredSection?.id;

      const updatedSections = sections.map((s) => {
        if (s?.id === sourceSectionId) {
          // Remove from source subsection
          const subSection = s.inputs[sourceSubSectionId];
          if (subSection && subSection.type === 'SubSection') {
            const updatedSubInputs = { ...subSection.inputs };
            delete updatedSubInputs[draggedInput?.id];
            
            // If source and target are the same section, also add to section
            if (s?.id === targetSectionId) {
              const inputKeys = Object.keys(s.inputs || {});
              const regularInputKeys = inputKeys.filter(key => s.inputs[key]?.type !== 'SubSection');
              const targetIndex = swipeTargetId ? regularInputKeys.indexOf(swipeTargetId) : -1;
              
              const { sourceSubSectionId: _, sourceSectionId: __, ...cleanedInput } = draggedInput;
              const draggedInputWithAnimation = { ...cleanedInput, animationClass: "swipe-animation" };
              
              const newInputs = {};
              if (targetIndex === -1) {
                regularInputKeys.forEach((key) => {
                  newInputs[key] = s.inputs[key];
                });
                newInputs[draggedInput.id] = draggedInputWithAnimation;
                inputKeys.forEach(key => {
                  if (s.inputs[key]?.type === 'SubSection' && key !== sourceSubSectionId) {
                    newInputs[key] = s.inputs[key];
                  }
                });
                // Add the modified source subsection
                newInputs[sourceSubSectionId] = {
                  ...subSection,
                  inputs: updatedSubInputs
                };
              } else {
                regularInputKeys.forEach((key, index) => {
                  if (index === targetIndex) {
                    newInputs[draggedInput.id] = draggedInputWithAnimation;
                  }
                  newInputs[key] = s.inputs[key];
                });
                if (!newInputs[draggedInput.id]) {
                  newInputs[draggedInput.id] = draggedInputWithAnimation;
                }
                inputKeys.forEach(key => {
                  if (s.inputs[key]?.type === 'SubSection' && key !== sourceSubSectionId) {
                    newInputs[key] = s.inputs[key];
                  }
                });
                newInputs[sourceSubSectionId] = {
                  ...subSection,
                  inputs: updatedSubInputs
                };
              }
              
              return { ...s, inputs: newInputs };
            }
            
            return {
              ...s,
              inputs: {
                ...s.inputs,
                [sourceSubSectionId]: {
                  ...subSection,
                  inputs: updatedSubInputs
                }
              }
            };
          }
        } else if (s?.id === targetSectionId && sourceSectionId !== targetSectionId) {
          // Add to target section (different section)
          const inputKeys = Object.keys(s.inputs || {});
          const regularInputKeys = inputKeys.filter(key => s.inputs[key]?.type !== 'SubSection');
          const targetIndex = swipeTargetId ? regularInputKeys.indexOf(swipeTargetId) : -1;
          
          const { sourceSubSectionId: _, sourceSectionId: __, ...cleanedInput } = draggedInput;
          const draggedInputWithAnimation = { ...cleanedInput, animationClass: "swipe-animation" };
          
          const newInputs = {};
          if (targetIndex === -1) {
            regularInputKeys.forEach((key) => {
              newInputs[key] = s.inputs[key];
            });
            newInputs[draggedInput.id] = draggedInputWithAnimation;
            inputKeys.forEach(key => {
              if (s.inputs[key]?.type === 'SubSection') {
                newInputs[key] = s.inputs[key];
              }
            });
          } else {
            regularInputKeys.forEach((key, index) => {
              if (index === targetIndex) {
                newInputs[draggedInput.id] = draggedInputWithAnimation;
              }
              newInputs[key] = s.inputs[key];
            });
            if (!newInputs[draggedInput.id]) {
              newInputs[draggedInput.id] = draggedInputWithAnimation;
            }
            inputKeys.forEach(key => {
              if (s.inputs[key]?.type === 'SubSection') {
                newInputs[key] = s.inputs[key];
              }
            });
          }
          
          return { ...s, inputs: newInputs };
        }
        return s;
      });

      setSections(updatedSections);

      // Remove animation class after animation
      setTimeout(() => {
        setSections((prevSections) =>
          prevSections.map((s) => {
            if (s.id === targetSectionId && s.inputs && s.inputs[draggedInput?.id]) {
              return {
                ...s,
                inputs: {
                  ...deepCloneInputs(s.inputs),
                  [draggedInput.id]: { ...s.inputs[draggedInput.id], animationClass: "" }
              }
              };
            }
            return s;
          })
        );
      }, 500);

      setDraggedInput(null);
      setHoveredSection(null);
      setHoveredSubSection(null);
      setSwipeTargetId(null);
      setIsDraggingFromInputList(false);
      // Clean up refs
      dropTargetRef.current = null;
      isOverSubSectionRef.current = false;
      subsectionDropProcessedRef.current = false;
      return;
    }

    if (sec?.id === hoveredSection?.id && draggedInput && swipeTargetId && draggedInput.id !== swipeTargetId) {
      // SAME SECTION: Reorder within section
      const inputs = deepCloneInputs(hoveredSection.inputs);
      const inputKeys = Object.keys(inputs);
      const draggedIndex = inputKeys.indexOf(draggedInput.id);
      const targetIndex = inputKeys.indexOf(swipeTargetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Add animation classes (immutably)
        if (inputs[draggedInput.id]) {
          inputs[draggedInput.id] = { ...inputs[draggedInput.id], animationClass: "swipe-animation" };
        }
        if (inputs[swipeTargetId]) {
          inputs[swipeTargetId] = { ...inputs[swipeTargetId], animationClass: "swipe-animation" };
        }

        inputKeys.splice(draggedIndex, 1);
        inputKeys.splice(targetIndex, 0, draggedInput.id);
        const newInputs = {};
        inputKeys.forEach((key) => {
          newInputs[key] = inputs[key];
        });

        // Create new state immutably
        const updatedSections = sections.map((s) => {
          if (s.id === hoveredSection.id) {
            return { ...s, inputs: newInputs };
          }
          return s;
        });
        setSections(updatedSections);

        // Remove animation classes after the animation duration
        setTimeout(() => {
          setSections((prevSections) =>
            prevSections.map((s) => {
              if (s.id === hoveredSection.id) {
                const clearedInputs = {};
                Object.entries(s.inputs || {}).forEach(([key, value]) => {
                  clearedInputs[key] = { ...value, animationClass: "" };
                });
                return { ...s, inputs: clearedInputs };
              }
              return s;
            })
          );
        }, 500);
      }
    } else if (sec?.id !== hoveredSection?.id && draggedInput && hoveredSection && !isFromSubSection) {
      // DIFFERENT SECTION: Move input from one section to another (section to section only)
      const updatedSections = sections.map((s) => {
        if (s?.id === sec?.id && hoveredSection?.id !== sec?.id) {
          // Remove from source section - use deepClone to avoid reference issues
          const clonedInputs = deepCloneInputs(s.inputs || {});
          delete clonedInputs[draggedInput?.id];
          return { ...s, inputs: clonedInputs };
        } else if (s?.id === hoveredSection?.id) {
          // Add to target section - deep clone existing inputs
          const clonedExisting = deepCloneInputs(s.inputs || {});
          const inputKeys = Object.keys(clonedExisting);
          // Filter out SubSections for positioning
          const regularInputKeys = inputKeys.filter(key => clonedExisting[key]?.type !== 'SubSection');
          const targetIndex = swipeTargetId ? regularInputKeys.indexOf(swipeTargetId) : -1;

          // Add animation class and initialize inputs if needed
          const { sourceSubSectionId: _, sourceSectionId: __, ...cleanedInput } = draggedInput;
          const draggedInputWithAnimation = { ...cleanedInput, animationClass: "swipe-animation" };

          // Insert the dragged input into the new position
          const newInputs = {};
          
          if (targetIndex === -1) {
            // If no target, add regular fields first, then the dragged input, then SubSections
            regularInputKeys.forEach((key) => {
              newInputs[key] = clonedExisting[key];
            });
            newInputs[draggedInput.id] = draggedInputWithAnimation;
            // Add SubSections at the end
            inputKeys.forEach(key => {
              if (clonedExisting[key]?.type === 'SubSection') {
                newInputs[key] = clonedExisting[key];
              }
            });
          } else {
            // Insert at correct position among regular fields
            regularInputKeys.forEach((key, index) => {
              if (index === targetIndex) {
                newInputs[draggedInput.id] = draggedInputWithAnimation;
              }
              newInputs[key] = clonedExisting[key];
            });
            // If we didn't insert yet (target was last), add it
            if (!newInputs[draggedInput.id]) {
              newInputs[draggedInput.id] = draggedInputWithAnimation;
            }
            // Add SubSections at the end
            inputKeys.forEach(key => {
              if (clonedExisting[key]?.type === 'SubSection') {
                newInputs[key] = clonedExisting[key];
              }
            });
          }

          return { ...s, inputs: newInputs };
        }
        return s;
      });

      setSections(updatedSections);

      // Remove animation classes after the animation duration
      setTimeout(() => {
        setSections((prevSections) =>
          prevSections.map((s) => {
            if (s.id === hoveredSection?.id && s.inputs) {
              const clearedInputs = {};
              Object.entries(s.inputs).forEach(([key, value]) => {
                if (key === draggedInput?.id || key === swipeTargetId) {
                  clearedInputs[key] = { ...value, animationClass: "" };
                } else if (value?.type === 'SubSection') {
                  clearedInputs[key] = { ...value, inputs: deepCloneInputs(value.inputs || {}) };
                } else {
                  clearedInputs[key] = { ...value };
                }
              });
              return { ...s, inputs: clearedInputs };
            }
            return s;
          })
        );
      }, 500);
    }

    setDraggedInput(null);
    setHoveredSection(null);
    setHoveredSubSection(null);
    setSwipeTargetId(null);
    setIsDraggingFromInputList(false);
    // Clean up refs
    dropTargetRef.current = null;
    isOverSubSectionRef.current = false;
    subsectionDropProcessedRef.current = false;
    stopDragAutoScroll(); // Stop auto-scroll when drag ends
  };

  const handleSwipeInputInsideSubSection = (section, subSectionId, event) => {
    event.preventDefault();
    event.stopPropagation();

    const sourceSubSectionId = draggedInput?.sourceSubSectionId;
    const sourceSectionId = draggedInput?.sourceSectionId;
    const targetSubSectionId = hoveredSubSection?.id || subSectionId;
    const targetSectionId = hoveredSection?.id || section?.id;
    
    // SUBSECTION → SECTION: When dropping on a section (not a subsection)
    // This handles BOTH same section AND different section cases
    if (draggedInput && sourceSubSectionId && hoveredSection && !hoveredSubSection) {
      const draggedInputId = draggedInput.id;
      const capturedTargetSectionId = targetSectionId;
      const isSameSection = sourceSectionId === capturedTargetSectionId;
      
      const { sourceSubSectionId: _a, sourceSectionId: _b, ...cleanedInput } = draggedInput;
      const draggedInputWithAnimation = { ...cleanedInput, animationClass: "swipe-animation" };
      
      const updatedSections = sections.map((s) => {
        // SAME SECTION: Remove from subsection AND add to section in one operation
        if (isSameSection && s?.id === sourceSectionId) {
          const srcSubSection = s.inputs[sourceSubSectionId];
          if (srcSubSection && srcSubSection.type === 'SubSection') {
            // Remove from subsection
            const updatedSubInputs = { ...srcSubSection.inputs };
            delete updatedSubInputs[draggedInputId];
            
            // Build new inputs with the field added to section
            const inputKeys = Object.keys(s.inputs || {});
            const regularInputKeys = inputKeys.filter(key => s.inputs[key]?.type !== 'SubSection');
            const targetIndex = swipeTargetId ? regularInputKeys.indexOf(swipeTargetId) : -1;
            
            const newInputs = {};
            if (targetIndex === -1) {
              // Add regular fields first
              regularInputKeys.forEach((key) => {
                newInputs[key] = s.inputs[key];
              });
              // Add the dragged field
              newInputs[draggedInputId] = draggedInputWithAnimation;
              // Add subsections (with modified source subsection)
              inputKeys.forEach(key => {
                if (s.inputs[key]?.type === 'SubSection') {
                  if (key === sourceSubSectionId) {
                    newInputs[key] = { ...srcSubSection, inputs: updatedSubInputs };
                  } else {
                    newInputs[key] = s.inputs[key];
                  }
                }
              });
            } else {
              // Insert at target position
              regularInputKeys.forEach((key, index) => {
                if (index === targetIndex) {
                  newInputs[draggedInputId] = draggedInputWithAnimation;
                }
                newInputs[key] = s.inputs[key];
              });
              if (!newInputs[draggedInputId]) {
                newInputs[draggedInputId] = draggedInputWithAnimation;
              }
              // Add subsections (with modified source subsection)
              inputKeys.forEach(key => {
                if (s.inputs[key]?.type === 'SubSection') {
                  if (key === sourceSubSectionId) {
                    newInputs[key] = { ...srcSubSection, inputs: updatedSubInputs };
                  } else {
                    newInputs[key] = s.inputs[key];
                  }
                }
              });
            }
            
            return { ...s, inputs: newInputs };
          }
        }
        
        // DIFFERENT SECTION: Handle source section - remove from subsection
        if (!isSameSection && s?.id === sourceSectionId) {
          const srcSubSection = s.inputs[sourceSubSectionId];
          if (srcSubSection && srcSubSection.type === 'SubSection') {
            const updatedSubInputs = { ...srcSubSection.inputs };
            delete updatedSubInputs[draggedInputId];
            return {
              ...s,
              inputs: {
                ...s.inputs,
                [sourceSubSectionId]: {
                  ...srcSubSection,
                  inputs: updatedSubInputs
                }
              }
            };
          }
        }
        
        // DIFFERENT SECTION: Handle target section - add to section
        if (!isSameSection && s?.id === capturedTargetSectionId) {
          const inputKeys = Object.keys(s.inputs || {});
          const regularInputKeys = inputKeys.filter(key => s.inputs[key]?.type !== 'SubSection');
          const targetIndex = swipeTargetId ? regularInputKeys.indexOf(swipeTargetId) : -1;
          
          const newInputs = {};
          if (targetIndex === -1) {
            regularInputKeys.forEach((key) => {
              newInputs[key] = s.inputs[key];
            });
            newInputs[draggedInputId] = draggedInputWithAnimation;
            inputKeys.forEach(key => {
              if (s.inputs[key]?.type === 'SubSection') {
                newInputs[key] = s.inputs[key];
              }
            });
          } else {
            regularInputKeys.forEach((key, index) => {
              if (index === targetIndex) {
                newInputs[draggedInputId] = draggedInputWithAnimation;
              }
              newInputs[key] = s.inputs[key];
            });
            if (!newInputs[draggedInputId]) {
              newInputs[draggedInputId] = draggedInputWithAnimation;
            }
            inputKeys.forEach(key => {
              if (s.inputs[key]?.type === 'SubSection') {
                newInputs[key] = s.inputs[key];
              }
            });
          }
          
          return { ...s, inputs: newInputs };
        }
        
        return s;
      });

      setSections(updatedSections);

      // Remove animation class after animation
      setTimeout(() => {
        setSections((prevSections) =>
          prevSections.map((s) => {
            if (s.id === capturedTargetSectionId) {
              if (s.inputs && s.inputs[draggedInputId]) {
                return {
                  ...s,
                  inputs: {
                    ...s.inputs,
                    [draggedInputId]: {
                      ...s.inputs[draggedInputId],
                      animationClass: ""
                    }
                  }
                };
              }
            }
            return s;
          })
        );
      }, 500);

      // CRITICAL: Clean up ALL state and refs
      setDraggedInput(null);
      setHoveredSection(null);
      setHoveredSubSection(null);
      setSwipeTargetId(null);
      setIsDraggingFromInputList(false);
      dropTargetRef.current = null;
      isOverSubSectionRef.current = false;
      subsectionDropProcessedRef.current = false;
      return;
    }
    
    // Check if we're moving from a different location (section, different subsection, or different section's subsection)
    const isFromSection = !sourceSubSectionId && sourceSectionId;
    const isFromDifferentSubSection = sourceSubSectionId && sourceSubSectionId !== targetSubSectionId;
    const isFromDifferentSection = sourceSectionId && sourceSectionId !== targetSectionId;
    
    if (draggedInput && hoveredSubSection && (isFromSection || isFromDifferentSubSection || isFromDifferentSection)) {
      // Cross-location move: section→subsection, subsection→subsection (different), or across sections
      const updatedSections = sections.map((s) => {
        // Handle source section
        if (s?.id === sourceSectionId) {
          if (isFromSection) {
            // Remove from source section (not subsection)
            const updatedInputs = { ...s.inputs };
            delete updatedInputs[draggedInput?.id];
            
            // If same section, also add to target subsection
            if (s?.id === targetSectionId) {
              const targetSubSection = updatedInputs[targetSubSectionId];
              if (targetSubSection && targetSubSection.type === 'SubSection') {
                const { sourceSubSectionId: _, sourceSectionId: __, ...cleanedInput } = draggedInput;
                const newField = { ...cleanedInput, animationClass: "swipe-animation" };
                return {
                  ...s,
                  inputs: {
                    ...updatedInputs,
                    [targetSubSectionId]: {
                      ...targetSubSection,
                      inputs: {
                        ...targetSubSection.inputs,
                        [draggedInput.id]: newField
                      }
                    }
                  }
                };
              }
            }
            return { ...s, inputs: updatedInputs };
          } else if (sourceSubSectionId) {
            // Remove from source subsection
            const sourceSubSection = s.inputs[sourceSubSectionId];
            if (sourceSubSection && sourceSubSection.type === 'SubSection') {
              const updatedSubInputs = { ...sourceSubSection.inputs };
              delete updatedSubInputs[draggedInput?.id];
              
              // If same section, also add to target subsection
              if (s?.id === targetSectionId) {
                const targetSubSection = s.inputs[targetSubSectionId];
                if (targetSubSection && targetSubSection.type === 'SubSection') {
                  const { sourceSubSectionId: _, sourceSectionId: __, ...cleanedInput } = draggedInput;
                  const newField = { ...cleanedInput, animationClass: "swipe-animation" };
                  return {
                    ...s,
                    inputs: {
                      ...s.inputs,
                      [sourceSubSectionId]: {
                        ...sourceSubSection,
                        inputs: updatedSubInputs
                      },
                      [targetSubSectionId]: {
                        ...targetSubSection,
                        inputs: {
                          ...targetSubSection.inputs,
                          [draggedInput.id]: newField
                        }
                      }
                    }
                  };
                }
              }
              
              return {
                ...s,
                inputs: {
                  ...s.inputs,
                  [sourceSubSectionId]: {
                    ...sourceSubSection,
                    inputs: updatedSubInputs
                  }
                }
              };
            }
          }
        }
        
        // Handle target section (if different from source)
        if (s?.id === targetSectionId && sourceSectionId !== targetSectionId) {
          const targetSubSection = s.inputs[targetSubSectionId];
          if (targetSubSection && targetSubSection.type === 'SubSection') {
            const { sourceSubSectionId: _, sourceSectionId: __, ...cleanedInput } = draggedInput;
            const newField = { ...cleanedInput, animationClass: "swipe-animation" };
            return {
              ...s,
              inputs: {
                ...s.inputs,
                [targetSubSectionId]: {
                  ...targetSubSection,
                  inputs: {
                    ...targetSubSection.inputs,
                    [draggedInput.id]: newField
                  }
                }
              }
            };
          }
        }
        
        return s;
      });

      setSections(updatedSections);

      // Remove animation class after animation
      setTimeout(() => {
        setSections((prevSections) =>
          prevSections.map((s) => {
            if (s.id === targetSectionId) {
              const targetSubSection = s.inputs[targetSubSectionId];
              if (targetSubSection && targetSubSection.inputs && targetSubSection.inputs[draggedInput?.id]) {
                return {
                  ...s,
                  inputs: {
                    ...s.inputs,
                    [targetSubSectionId]: {
                      ...targetSubSection,
                      inputs: {
                        ...targetSubSection.inputs,
                        [draggedInput.id]: {
                          ...targetSubSection.inputs[draggedInput.id],
                          animationClass: ""
                        }
                      }
                    }
                  }
                };
              }
            }
            return s;
          })
        );
      }, 500);
    } else if (section?.id === hoveredSection?.id && hoveredSubSection?.id === subSectionId && draggedInput && swipeTargetId && draggedInput.id !== swipeTargetId) {
      // SAME SUBSECTION: Reorder within subsection
      const subSection = section.inputs[subSectionId];
      const inputs = { ...subSection.inputs };
      const inputKeys = Object.keys(inputs);
      const draggedIndex = inputKeys.indexOf(draggedInput.id);
      const targetIndex = inputKeys.indexOf(swipeTargetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Clone inputs with animation classes (no mutation)
        const animatedInputs = {};
        Object.entries(inputs).forEach(([key, value]) => {
          if (key === draggedInput.id || key === swipeTargetId) {
            animatedInputs[key] = { ...value, animationClass: "swipe-animation" };
          } else {
            animatedInputs[key] = { ...value };
        }
        });

        inputKeys.splice(draggedIndex, 1);
        inputKeys.splice(targetIndex, 0, draggedInput.id);
        const newInputs = {};
        inputKeys.forEach((key) => {
          newInputs[key] = animatedInputs[key];
        });

        // Create new state immutably
        const updatedSections = sections.map((s) => {
          if (s.id === section.id) {
            return {
              ...s,
              inputs: {
                ...deepCloneInputs(s.inputs),
                [subSectionId]: {
                  ...s.inputs[subSectionId],
                  inputs: newInputs
                }
              }
            };
          }
          return s;
        });
        setSections(updatedSections);

        // Remove animation classes after the animation duration
        setTimeout(() => {
          setSections((prevSections) =>
            prevSections.map((s) => {
              if (s.id === section.id) {
                const currentSubSection = s.inputs[subSectionId];
                if (!currentSubSection?.inputs) return s;
                
                const clearedInputs = {};
                Object.entries(currentSubSection.inputs).forEach(([key, value]) => {
                  clearedInputs[key] = { ...value, animationClass: "" };
                });
                
                return {
                  ...s,
                  inputs: {
                    ...deepCloneInputs(s.inputs),
                    [subSectionId]: {
                      ...currentSubSection,
                      inputs: clearedInputs
                  }
                  }
                };
              }
              return s;
            })
          );
        }, 500);
      }
    }
    
    setDraggedInput(null);
    setHoveredSection(null);
    setHoveredSubSection(null);
    setSwipeTargetId(null);
    setIsDraggingFromInputList(false);
    // Clean up refs
    dropTargetRef.current = null;
    isOverSubSectionRef.current = false;
    subsectionDropProcessedRef.current = false;
    stopDragAutoScroll(); // Stop auto-scroll when drag ends
  };

  // Show delete confirmation for sub-sections
  const showDeleteConfirmation = (sectionIndex, inputKey, subSectionId = null, parentSubSectionId = null) => {
    // Get the item to be deleted to show its label
    const section = sections[sectionIndex];
    let itemToDelete;
    let itemType = 'field';
    
    if (parentSubSectionId && subSectionId) {
      // Nested field or sub-section
      const parentSubSection = section?.inputs?.[parentSubSectionId];
      const nestedSubSection = parentSubSection?.inputs?.[subSectionId];
      itemToDelete = nestedSubSection?.inputs?.[inputKey];
    } else if (subSectionId) {
      // Field inside sub-section or sub-section itself
      const subSection = section?.inputs?.[subSectionId];
      itemToDelete = subSection?.inputs?.[inputKey];
    } else {
      // Direct field or sub-section in section
      itemToDelete = section?.inputs?.[inputKey];
    }
    
    if (itemToDelete?.type === 'SubSection') {
      itemType = 'subSection';
    }
    
    const itemLabel = itemToDelete?.label || itemToDelete?.name || 'this item';
    
    setDeleteConfirmModal({
      isOpen: true,
      type: itemType,
      label: itemLabel,
      sectionIndex,
      inputKey,
      subSectionId,
      parentSubSectionId
    });
  };
  
  // Close delete confirmation
  const closeDeleteConfirmation = () => {
    setDeleteConfirmModal({ 
      isOpen: false, 
      type: '', 
      label: '',
      sectionIndex: null, 
      inputKey: null, 
      subSectionId: null, 
      parentSubSectionId: null 
    });
  };
  
  // Confirm and execute delete
  const confirmDelete = () => {
    const { sectionIndex, inputKey, subSectionId, parentSubSectionId } = deleteConfirmModal;
    handleRemoveField(sectionIndex, inputKey, subSectionId, parentSubSectionId);
    closeDeleteConfirmation();
  };

  const handleRemoveField = (sectionIndex, inputKey, subSectionId = null, parentSubSectionId = null) => {
    setSections(prevSections => {
      return prevSections.map((section, idx) => {
        if (idx !== sectionIndex) {
          return section;
        }

        // Deep clone inputs to avoid reference issues
        const clonedInputs = deepCloneInputs(section.inputs || {});

        if (parentSubSectionId && subSectionId) {
          // Remove from nested sub-section (2 levels deep)
          const parentSubSection = clonedInputs[parentSubSectionId];
          if (parentSubSection?.inputs?.[subSectionId]) {
            const nestedSubSection = parentSubSection.inputs[subSectionId];
            if (nestedSubSection?.inputs && Object.prototype.hasOwnProperty.call(nestedSubSection.inputs, inputKey)) {
              delete nestedSubSection.inputs[inputKey];
            }
          }
          return { ...section, inputs: clonedInputs };
        } else if (subSectionId) {
          // Remove from first-level sub-section
          const subSection = clonedInputs[subSectionId];
          if (subSection?.inputs && Object.prototype.hasOwnProperty.call(subSection.inputs, inputKey)) {
            delete subSection.inputs[inputKey];
          }
          return { ...section, inputs: clonedInputs };
        } else {
          // Remove from main section
          if (Object.prototype.hasOwnProperty.call(clonedInputs, inputKey)) {
            delete clonedInputs[inputKey];
          }
          return { ...section, inputs: clonedInputs };
        }
      });
    });
  };

  const handleDragOverSection = (e, s) => {
    e.preventDefault();
    // Handle both InputList drags AND existing field drags between sections
    if (isDraggingFromInputList || draggedInput) {
      setHoveredSection(s);
      setHoveredSubSection(null); // CRITICAL: Clear sub-section hover when over main section
    }
  };

  const handleDragOverSectionDropArea = (e, s) => {
    // CRITICAL: Check if we're actually hovering over the section drop area itself
    // and NOT over a sub-section or its children
    const target = e.target;
    const isOverSubSection = target.closest('.form-builder-sub-section') !== null ||
      target.closest('[data-subsection-drop-area]') !== null;

    // If we're over a sub-section, DO ABSOLUTELY NOTHING - don't touch any state
    if (isOverSubSection) {
      // Don't prevent default, don't set any state, don't clear hoveredSubSection or ref
      // Just return and let sub-section handle everything
      return;
    }

    // CRITICAL: Only check dropTargetRef for InputList drags
    // For existing field drags, we don't use refs - they can cause issues
    if (isDraggingFromInputList && dropTargetRef.current) {
      // We were previously over a subsection during InputList drag, don't interfere
      return;
    }

    e.preventDefault();
    // Handle both InputList drags AND existing field drags between sections
    if (isDraggingFromInputList || draggedInput) {
      setHoveredSection(s);
      // Clear hoveredSubSection when over section drop area
      setHoveredSubSection(null);
    }
  };

  const handleSectionName = (value, sectionIndex) => {
    setSections(prevSections =>
      prevSections.map((section, idx) =>
        idx === sectionIndex
          ? { ...section, sectionsTitle: value }
          : section,
      ),
    );
  };

  const handleSubSectionName = (value, sectionIndex, subSectionId, parentSubSectionId = null) => {
    setSections(prevSections => {
      // Generate unique name for the subsection based on the label
      const uniqueName = generateUniqueInputName(value?.trim() || '', prevSections, subSectionId);
      
      return prevSections.map((section, idx) => {
        if (idx !== sectionIndex) return section;
        
        // Handle nested sub-section (sub-section inside sub-section)
        if (parentSubSectionId) {
          const parentSubSection = section.inputs[parentSubSectionId];
          if (parentSubSection && parentSubSection.type === 'SubSection') {
            const nestedSubSection = parentSubSection.inputs?.[subSectionId];
            if (nestedSubSection && nestedSubSection.type === 'SubSection') {
              return {
                ...section,
                inputs: {
                  ...section.inputs,
                  [parentSubSectionId]: {
                    ...parentSubSection,
                    inputs: {
                      ...parentSubSection.inputs,
                      [subSectionId]: {
                        ...nestedSubSection,
                        label: value,
                        name: uniqueName
                      }
                    }
                  }
                }
              };
            }
          }
          return section;
        }
        
        // Handle direct sub-section
          const subSection = section.inputs[subSectionId];
          if (subSection && subSection.type === 'SubSection') {
            return {
              ...section,
              inputs: {
                ...section.inputs,
                [subSectionId]: {
                  ...subSection,
                  label: value,
                  name: uniqueName  // Set name property for payload key
                }
              }
            };
        }
        return section;
      });
    });
  };

  const handleSubSectionPropertyChange = (sectionIndex, subSectionId, property, value) => {
    setSections(prevSections =>
      prevSections.map((section, idx) => {
        if (idx === sectionIndex) {
          const subSection = section.inputs[subSectionId];
          if (subSection && subSection.type === 'SubSection') {
            return {
              ...section,
              inputs: {
                ...section.inputs,
                [subSectionId]: {
                  ...subSection,
                  [property]: value
                }
              }
            };
          }
        }
        return section;
      })
    );
  };

  // Import from Module - Load form groups
  const loadImportFormGroups = async () => {
    setImportFormGroupsLoading(true);
    try {
      const response = await getFormGroupApi();
      if (response?.statusCode === 200) {
        const payload = response?.data ?? response;
        if (Array.isArray(payload)) {
          setImportFormGroups(payload);
        } else if (payload?.formData && Array.isArray(payload.formData)) {
          setImportFormGroups(payload.formData);
        } else if (typeof payload === 'object') {
          const findFirstArray = (input) => {
            if (!input) return [];
            if (Array.isArray(input)) return input;
            if (typeof input === 'object') {
              for (const value of Object.values(input)) {
                const result = findFirstArray(value);
                if (result.length) return result;
              }
            }
            return [];
          };
          setImportFormGroups(findFirstArray(payload));
        }
      }
    } catch (error) {
      setImportFormGroups([]);
    } finally {
      setImportFormGroupsLoading(false);
    }
  };

  // Import from Module - Load sections directly from module's form
  const loadModuleSections = async (moduleName) => {
    if (!moduleName) {
      setFormSections([]);
      return;
    }
    
    setFormSectionsLoading(true);
    try {
      const response = await getFormByTitleApi(moduleName);
      const formData = response?.data ?? response;
      const sections = formData?.sections || [];
      
      // Store sections with their index and full inputs for reference
      const sectionsWithIndex = sections.map((section, index) => ({
        ...section,
        sectionIndex: index,
        sectionId: section.id || `section-${index}`,
        sectionTitle: section.sectionsTitle || `Section ${index + 1}`
      }));
      
      setFormSections(sectionsWithIndex);
    } catch (error) {
      setFormSections([]);
    } finally {
      setFormSectionsLoading(false);
    }
  };

  // Import from Module - Add entire section to sub-section (same to same)
  const addSectionToSubSection = (sectionId) => {
    if (!sectionId) return;
    
    const section = formSections.find(s => s.sectionId === sectionId);
    if (!section || !section.inputs) return;
    
    const { sectionIndex, subSectionId, parentSubSectionId } = subSectionPropertiesModal;
    
    setSections(prevSections => {
      return prevSections.map((sec, idx) => {
        if (idx !== sectionIndex) return sec;
        
        const clonedInputs = deepCloneInputs(sec.inputs || {});
        
        // Find target sub-section
        let targetSubSection;
        if (parentSubSectionId) {
          targetSubSection = clonedInputs[parentSubSectionId]?.inputs?.[subSectionId];
        } else {
          targetSubSection = clonedInputs[subSectionId];
        }
        
        if (!targetSubSection || targetSubSection.type !== 'SubSection') {
          return sec;
        }
        
        // Add all inputs from the selected section (same to same)
        Object.entries(section.inputs || {}).forEach(([originalKey, input]) => {
          if (!input) return;
          
          const newId = `item-${genrateUID()}`;
          const label = input.label || input.name || 'Imported Field';
          const originalFieldName = input.name || originalKey;
          const uniqueName = generateUniqueInputName(label, prevSections, null);
          
          // Deep clone the input
          const newInput = JSON.parse(JSON.stringify(input));
          
          // Regenerate option IDs if present
          if (Array.isArray(newInput.options)) {
            newInput.options = newInput.options.map(opt => ({
              ...opt,
              id: genrateUID()
            }));
          }
          
          // If it's a SubSection, recursively regenerate IDs for nested inputs
          if (newInput.type === 'SubSection' && newInput.inputs) {
            const regenerateNestedInputs = (inputs) => {
              const newInputs = {};
              Object.entries(inputs || {}).forEach(([key, nestedInput]) => {
                const nestedNewId = `item-${genrateUID()}`;
                const nestedClone = JSON.parse(JSON.stringify(nestedInput));
                
                if (Array.isArray(nestedClone.options)) {
                  nestedClone.options = nestedClone.options.map(opt => ({
                    ...opt,
                    id: genrateUID()
                  }));
                }
                
                if (nestedClone.type === 'SubSection' && nestedClone.inputs) {
                  nestedClone.inputs = regenerateNestedInputs(nestedClone.inputs);
                }
                
                newInputs[nestedNewId] = {
                  ...nestedClone,
                  name: generateUniqueInputName(nestedClone.label || nestedClone.name || 'Field', prevSections, null),
                  animationClass: 'animate-new-input',
                  importedFromModule: selectedImportModule,
                  originalFieldName: nestedClone.name || key,
                };
              });
              return newInputs;
            };
            newInput.inputs = regenerateNestedInputs(newInput.inputs);
          }
          
          targetSubSection.inputs = {
            ...(targetSubSection.inputs || {}),
            [newId]: {
              ...newInput,
              name: uniqueName,
              animationClass: 'animate-new-input',
              importedFromModule: selectedImportModule,
              originalFieldName: originalFieldName,
            }
          };
        });
        
        return { ...sec, inputs: clonedInputs };
      });
    });
    
    // Reset after adding
    setFormSections([]);
    setSelectedImportModule(null);
    
    // Show success feedback
  };

  // Import from Module - Reset state
  const resetImportState = () => {
    setImportModuleEnabled(false);
    setSelectedImportModule(null);
    setFormSections([]);
  };

  // Section Import Modal - Open
  const openSectionImportModal = (sectionIndex) => {
    setSectionImportModal({ isOpen: true, sectionIndex });
    setSelectedSectionImportModule(null);
    setSectionImportFormSections([]);
    // Load form groups for module selection
    loadImportFormGroups();
  };

  // Section Import Modal - Close
  const closeSectionImportModal = () => {
    setSectionImportModal({ isOpen: false, sectionIndex: null });
    setSelectedSectionImportModule(null);
    setSectionImportFormSections([]);
  };

  // Section Import - Load sections from selected module
  const loadSectionImportModuleSections = async (moduleName) => {
    if (!moduleName) {
      setSectionImportFormSections([]);
      return;
    }
    
    setSectionImportLoading(true);
    try {
      const response = await getFormByTitleApi(moduleName);
      const formData = response?.data ?? response;
      const sections = formData?.sections || [];
      
      // Store sections with their index and full inputs for reference
      const sectionsWithIndex = sections.map((section, index) => ({
        ...section,
        sectionIndex: index,
        sectionId: section.id || `section-${index}`,
        sectionTitle: section.sectionsTitle || `Section ${index + 1}`
      }));
      
      setSectionImportFormSections(sectionsWithIndex);
    } catch (error) {
      setSectionImportFormSections([]);
    } finally {
      setSectionImportLoading(false);
    }
  };

  // Section Import - Add entire section content to current section
  const addImportedSectionToSection = (importSectionId) => {
    if (!importSectionId) return;
    
    const importSection = sectionImportFormSections.find(s => s.sectionId === importSectionId);
    if (!importSection || !importSection.inputs) return;
    
    const { sectionIndex } = sectionImportModal;
    
    setSections(prevSections => {
      return prevSections.map((sec, idx) => {
        if (idx !== sectionIndex) return sec;
        
        const clonedInputs = deepCloneInputs(sec.inputs || {});
        
        // Add all inputs from the imported section
        Object.entries(importSection.inputs || {}).forEach(([originalKey, input]) => {
          if (!input) return;
          
          const newId = `item-${genrateUID()}`;
          const label = input.label || input.name || 'Imported Field';
          const originalFieldName = input.name || originalKey;
          const uniqueName = generateUniqueInputName(label, prevSections, null);
          
          // Deep clone the input
          const newInput = JSON.parse(JSON.stringify(input));
          
          // Regenerate option IDs if present
          if (Array.isArray(newInput.options)) {
            newInput.options = newInput.options.map(opt => ({
              ...opt,
              id: genrateUID()
            }));
          }
          
          // If it's a SubSection, recursively regenerate IDs for nested inputs
          if (newInput.type === 'SubSection' && newInput.inputs) {
            const regenerateNestedInputs = (inputs) => {
              const newInputs = {};
              Object.entries(inputs || {}).forEach(([key, nestedInput]) => {
                const nestedNewId = `item-${genrateUID()}`;
                const nestedClone = JSON.parse(JSON.stringify(nestedInput));
                
                if (Array.isArray(nestedClone.options)) {
                  nestedClone.options = nestedClone.options.map(opt => ({
                    ...opt,
                    id: genrateUID()
                  }));
                }
                
                if (nestedClone.type === 'SubSection' && nestedClone.inputs) {
                  nestedClone.inputs = regenerateNestedInputs(nestedClone.inputs);
                }
                
                newInputs[nestedNewId] = {
                  ...nestedClone,
                  name: generateUniqueInputName(nestedClone.label || nestedClone.name || 'Field', prevSections, null),
                  animationClass: 'animate-new-input',
                  importedFromModule: selectedSectionImportModule,
                  originalFieldName: nestedClone.name || key,
                };
              });
              return newInputs;
            };
            newInput.inputs = regenerateNestedInputs(newInput.inputs);
          }
          
          clonedInputs[newId] = {
            ...newInput,
            name: uniqueName,
            animationClass: 'animate-new-input',
            importedFromModule: selectedSectionImportModule,
            originalFieldName: originalFieldName,
          };
        });
        
        return { ...sec, inputs: clonedInputs };
      });
    });
    
    // Close modal after import
    closeSectionImportModal();
    
    // Show success feedback
  };

  // Import from Module - Memoized options for dropdown
  const importModuleOptions = useMemo(() => {
    if (importFormGroups && Array.isArray(importFormGroups) && importFormGroups.length > 0) {
      return importFormGroups.map(g => ({
        label: g?.moduleLabel || g?.title || g?.name || g?._id || String(g?.id || ''),
        value: g?.moduleName || g?.name || g?._id || g?.id
      })).filter(opt => opt.value);
    }
    return [];
  }, [importFormGroups]);

  const openSubSectionProperties = (sectionIndex, subSectionId, parentSubSectionId = null) => {
    // Initialize temp state with current subsection properties
    const section = sections[sectionIndex];
    let subSection;
    
    // Handle nested sub-section
    if (parentSubSectionId) {
      const parentSubSection = section?.inputs[parentSubSectionId];
      subSection = parentSubSection?.inputs?.[subSectionId];
    } else {
      subSection = section?.inputs[subSectionId];
    }
    
    if (subSection) {
      setTempSubSectionProps({
        showAddButton: subSection.showAddButton || false,
        saveAndAddMore: subSection.saveAndAddMore || false,
        conditionalDisplay: subSection.conditionalDisplay || { enabled: false },
      });
    }
    // Reset import state when opening modal
    resetImportState();
    setSubSectionPropertiesModal({ isOpen: true, sectionIndex, subSectionId, parentSubSectionId });
  };

  const closeSubSectionProperties = () => {
    setSubSectionPropertiesModal({ isOpen: false, sectionIndex: null, subSectionId: null });
    setTempSubSectionProps(null); // Clear temp state
  };

  const saveSubSectionProperties = () => {
    if (!tempSubSectionProps) return;
    
    const { sectionIndex, subSectionId, parentSubSectionId } = subSectionPropertiesModal;
    
    setSections(prevSections => {
      return prevSections.map((section, idx) => {
        if (idx !== sectionIndex) return section;
        
        // Handle nested sub-section
        if (parentSubSectionId) {
          const parentSubSection = section.inputs[parentSubSectionId];
          if (!parentSubSection) return section;
          
          const nestedSubSection = parentSubSection.inputs?.[subSectionId];
          if (!nestedSubSection) return section;
          
          return {
            ...section,
            inputs: {
              ...section.inputs,
              [parentSubSectionId]: {
                ...parentSubSection,
                inputs: {
                  ...parentSubSection.inputs,
                  [subSectionId]: {
                    ...nestedSubSection,
                    showAddButton: tempSubSectionProps.showAddButton,
                    saveAndAddMore: tempSubSectionProps.saveAndAddMore,
                    conditionalDisplay: tempSubSectionProps.conditionalDisplay,
                  }
                }
              }
            }
          };
        }
        
        // Handle direct sub-section
        const subSection = section.inputs[subSectionId];
        if (!subSection) return section;
        
        return {
          ...section,
          inputs: {
            ...section.inputs,
            [subSectionId]: {
              ...subSection,
              showAddButton: tempSubSectionProps.showAddButton,
              saveAndAddMore: tempSubSectionProps.saveAndAddMore,
              conditionalDisplay: tempSubSectionProps.conditionalDisplay,
            }
          }
        };
      });
    });
    
    closeSubSectionProperties();
  };

  const addSection = () => {
    let data = [...sections];
    let id = `item-${genrateUID()}`;
    data.push({ id, sectionsTitle: `Section ${data.length + 1}`, inputs: {}, canRemove: true });
    setSections(data);
  };

  const addSubSection = (sectionIndex) => {
    setSections(prevSections => {
      // Generate unique ID first
      const id = `item-${genrateUID()}`;
      
      // Count ALL first-level sub-sections across the entire form for truly unique naming
      let totalSubSectionCount = 0;
      prevSections.forEach(s => {
        Object.values(s.inputs || {}).forEach(input => {
          if (input?.type === 'SubSection') totalSubSectionCount++;
        });
      });
      
      const defaultLabel = `Sub-Section ${totalSubSectionCount + 1}`;
      const uniqueName = generateUniqueInputName(defaultLabel, prevSections, id);
      
          const newSubSection = {
            id,
            type: 'SubSection',
            label: defaultLabel,
        name: uniqueName,
        inputs: {}, // Fresh empty object for new sub-section
            removeAble: true
          };
      
      // Deep clone to avoid reference issues
      return prevSections.map((sec, idx) => {
        if (idx !== sectionIndex) return sec;
        
        // Deep clone ALL existing inputs to avoid ANY reference issues
        const clonedInputs = deepCloneInputs(sec.inputs || {});
        
          return {
            ...sec,
            inputs: {
            ...clonedInputs,
              [id]: newSubSection
            }
          };
      });
    });
  };

  // Add nested sub-section inside a parent sub-section
  // grandparentSubSectionId is optional - used when adding 3rd level sub-sections
  const addNestedSubSection = (sectionIndex, parentSubSectionId, grandparentSubSectionId = null) => {
    setSections(prevSections => {
      // Create new sections array with deep clone to avoid reference issues
      return prevSections.map((sec, idx) => {
        if (idx !== sectionIndex) return sec;
        
        // Deep clone ALL existing inputs to avoid reference issues
        const clonedInputs = deepCloneInputs(sec.inputs || {});
        
        let targetParent;
        if (grandparentSubSectionId) {
          // Adding 3rd level sub-section: grandparent → parent → new sub-section
          const grandparent = clonedInputs[grandparentSubSectionId];
          if (!grandparent?.inputs?.[parentSubSectionId]) return sec;
          targetParent = grandparent.inputs[parentSubSectionId];
        } else {
          // Adding 2nd level sub-section: parent → new sub-section
          targetParent = clonedInputs[parentSubSectionId];
        }
        
        if (!targetParent || targetParent.type !== 'SubSection') return sec;
        
        // Generate unique ID first
        const id = `item-${genrateUID()}`;
        
        // Count ALL nested sub-sections across the entire form for truly unique naming
        let totalNestedCount = 0;
        const countNestedSubSections = (inputs) => {
          if (!inputs) return;
          Object.values(inputs).forEach(input => {
            if (input?.type === 'SubSection') {
              totalNestedCount++;
              if (input.inputs) countNestedSubSections(input.inputs);
            }
          });
        };
        prevSections.forEach(s => countNestedSubSections(s.inputs));
        
        const defaultLabel = `Nested Sub-Section ${totalNestedCount + 1}`;
        const uniqueName = generateUniqueInputName(defaultLabel, prevSections, id);
        
        const newNestedSubSection = {
          id,
          type: 'SubSection',
          label: defaultLabel,
          name: uniqueName,
          inputs: {},
          removeAble: true
        };
        
        // Add the new nested sub-section to the target parent
        targetParent.inputs = {
          ...(targetParent.inputs || {}),
          [id]: newNestedSubSection
        };
        
        return {
          ...sec,
          inputs: clonedInputs
        };
      });
    });
  };

  const removeSection = (sId) => {
    let data = sections.filter(section => section?.id !== sId);
    setSections(data);
  };

  const handleFieldOnChange = (e, section, subSectionId = null, parentSubSectionId = null) => {
    let { name, value, id } = e.target;
    let data = sections?.map((sec) => {
      if (section?.id !== sec?.id) return sec;
      
      // Deep clone inputs to avoid reference issues
      const clonedInputs = deepCloneInputs(sec.inputs || {});
      
      if (parentSubSectionId && subSectionId) {
        // Update inside nested sub-section (2 levels deep)
        const parentSubSection = clonedInputs[parentSubSectionId];
        if (parentSubSection?.inputs?.[subSectionId]) {
          const nestedSubSection = parentSubSection.inputs[subSectionId];
          if (name === 'label') {
            const uniqueName = generateUniqueInputName(value?.trim() || '', sections, id);
            nestedSubSection.inputs = {
              ...nestedSubSection.inputs,
              [id]: {
                ...nestedSubSection.inputs?.[id],
                [name]: value,
                name: uniqueName,
              }
            };
          } else {
            nestedSubSection.inputs = {
              ...nestedSubSection.inputs,
              [id]: {
                ...nestedSubSection.inputs?.[id],
                [name]: value,
              }
            };
          }
        }
      } else if (subSectionId) {
        // Update inside first-level sub-section
        const subSection = clonedInputs[subSectionId];
        if (subSection) {
          if (name === 'label') {
            const uniqueName = generateUniqueInputName(value?.trim() || '', sections, id);
            subSection.inputs = {
              ...subSection.inputs,
              [id]: {
                ...subSection.inputs?.[id],
                [name]: value,
                name: uniqueName,
              }
            };
          } else {
            subSection.inputs = {
              ...subSection.inputs,
              [id]: {
                ...subSection.inputs?.[id],
                [name]: value,
              }
            };
          }
        }
      } else {
        // Update in main section
        if (name === 'label') {
          const uniqueName = generateUniqueInputName(value?.trim() || '', sections, id);
          clonedInputs[id] = {
            ...clonedInputs[id],
            [name]: value,
            name: uniqueName,
          };
        } else {
          clonedInputs[id] = {
            ...clonedInputs[id],
            [name]: value,
          };
        }
      }
      
      return { ...sec, inputs: clonedInputs };
    });
    setSections(data);
  };

  const handleRequired = (id, required, section, subSectionId = null, parentSubSectionId = null) => {
    let sName = section?.sectionsTitle;
    let data = sections?.map((sec) => {
      if (sName !== sec?.sectionsTitle) return sec;
      
      // Deep clone inputs to avoid reference issues
      const clonedInputs = deepCloneInputs(sec.inputs || {});
      
      // If this is a nested sub-section field (2 levels deep)
      if (parentSubSectionId && subSectionId && clonedInputs[parentSubSectionId]?.type === 'SubSection') {
        const parentSubSection = clonedInputs[parentSubSectionId];
        const nestedSubSection = parentSubSection.inputs?.[subSectionId];
        if (nestedSubSection?.type === 'SubSection') {
          nestedSubSection.inputs = {
            ...nestedSubSection.inputs,
                [id]: {
              ...nestedSubSection.inputs?.[id],
              quick: required ? true : nestedSubSection.inputs?.[id]?.quick || false,
                  required,
                }
          };
        }
      } else if (subSectionId && clonedInputs[subSectionId]?.type === 'SubSection') {
        // First-level sub-section field
        const subSection = clonedInputs[subSectionId];
        subSection.inputs = {
          ...subSection.inputs,
          [id]: {
            ...subSection.inputs?.[id],
            quick: required ? true : subSection.inputs?.[id]?.quick || false,
            required,
            }
          };
        } else {
          // Regular field
        clonedInputs[id] = {
          ...clonedInputs[id],
          quick: required ? true : clonedInputs[id]?.quick || false,
            required,
        };
        }
      
      return { ...sec, inputs: clonedInputs };
    });
    setSections(data);
  };

  const handleQuickCreate = (id, quick, section, subSectionId = null, parentSubSectionId = null) => {
    let sName = section?.sectionsTitle;
    let data = sections?.map((sec) => {
      if (sName !== sec?.sectionsTitle) return sec;
      
      // Deep clone inputs to avoid reference issues
      const clonedInputs = deepCloneInputs(sec.inputs || {});
      
      // If this is a nested sub-section field (2 levels deep)
      if (parentSubSectionId && subSectionId && clonedInputs[parentSubSectionId]?.type === 'SubSection') {
        const parentSubSection = clonedInputs[parentSubSectionId];
        const nestedSubSection = parentSubSection.inputs?.[subSectionId];
        if (nestedSubSection?.type === 'SubSection') {
          nestedSubSection.inputs = {
            ...nestedSubSection.inputs,
                [id]: {
              ...nestedSubSection.inputs?.[id],
                  quick,
                }
          };
        }
      } else if (subSectionId && clonedInputs[subSectionId]?.type === 'SubSection') {
        // First-level sub-section field
        const subSection = clonedInputs[subSectionId];
        subSection.inputs = {
          ...subSection.inputs,
          [id]: {
            ...subSection.inputs?.[id],
            quick,
            }
          };
        } else {
          // Regular field
        clonedInputs[id] = {
          ...clonedInputs[id],
            quick,
        };
        }
      
      return { ...sec, inputs: clonedInputs };
    });
    setSections(data);
  };

  const handleViewable = (id, isViewable, section, subSectionId = null, parentSubSectionId = null) => {
    let sName = section?.sectionsTitle;
    let data = sections?.map((sec) => {
      if (sName !== sec?.sectionsTitle) return sec;
      
      // Deep clone inputs to avoid reference issues
      const clonedInputs = deepCloneInputs(sec.inputs || {});
      
      // If this is a nested sub-section field (2 levels deep)
      if (parentSubSectionId && subSectionId && clonedInputs[parentSubSectionId]?.type === 'SubSection') {
        const parentSubSection = clonedInputs[parentSubSectionId];
        const nestedSubSection = parentSubSection.inputs?.[subSectionId];
        if (nestedSubSection?.type === 'SubSection') {
          nestedSubSection.inputs = {
            ...nestedSubSection.inputs,
            [id]: {
              ...nestedSubSection.inputs?.[id],
              isViewable,
            }
          };
        }
      } else if (subSectionId && clonedInputs[subSectionId]?.type === 'SubSection') {
        // First-level sub-section field
        const subSection = clonedInputs[subSectionId];
        subSection.inputs = {
          ...subSection.inputs,
          [id]: {
            ...subSection.inputs?.[id],
            isViewable,
          }
        };
      } else {
        // Regular field
        clonedInputs[id] = {
          ...clonedInputs[id],
          isViewable,
        };
      }
      
      return { ...sec, inputs: clonedInputs };
    });
    setSections(data);
  };

  const handleDragEndSection = (e, s) => {
    let typeis = e.target.id;
    function swapSectionsById(sections, id1, id2) {
      const index1 = sections.findIndex(section => section.id === id1);
      const index2 = sections.findIndex(section => section.id === id2);
      if (index1 !== -1 && index2 !== -1) {
        [sections[index1], sections[index2]] = [sections[index2], sections[index1]];
      }
      return sections;
    }

    if (typeis === 'section' && hoveredSection) {
      const updatedSections = swapSectionsById([...sections], s?.id, hoveredSection?.id);
      setSections(updatedSections);
      setHoveredSection(null);
      setDraggedInput(null);
      setSwipeTargetId(null);
      setIsDraggingFromInputList(false);
    }
    stopDragAutoScroll(); // Stop auto-scroll when section drag ends
  };

  if (formLoading) {
    return <div className="form-builder-loading">Loading form...</div>;
  }

  return (
    <FormBuilderPanels
      sections={sections}
      addSection={addSection}
      handleInputDragEnd={handleInputDragEnd}
      handleInputDragStart={handleInputDragStart}
      startDragAutoScroll={startDragAutoScroll}
      handleDragEndSection={handleDragEndSection}
      handleSectionName={handleSectionName}
      addSubSection={addSubSection}
      removeSection={removeSection}
      hoveredSection={hoveredSection}
      hoveredSubSection={hoveredSubSection}
      handleDragOverSectionDropArea={handleDragOverSectionDropArea}
      handleDragSectionInputOver={handleDragSectionInputOver}
      handleDragSectionInput={handleDragSectionInput}
      handleSwipeInputInsideSection={handleSwipeInputInsideSection}
      handleSwipeInputInsideSubSection={handleSwipeInputInsideSubSection}
      addNestedSubSection={addNestedSubSection}
      openSubSectionProperties={openSubSectionProperties}
      showDeleteConfirmation={showDeleteConfirmation}
      handleSubSectionName={handleSubSectionName}
      handleDragOverSubSection={handleDragOverSubSection}
      draggedInput={draggedInput}
      isDraggingFromInputList={isDraggingFromInputList}
      dropTargetRef={dropTargetRef}
      subsectionDropProcessedRef={subsectionDropProcessedRef}
      isOverSubSectionRef={isOverSubSectionRef}
      setHoveredSection={setHoveredSection}
      setHoveredSubSection={setHoveredSubSection}
      swipeTargetId={swipeTargetId}
      setSwipeTargetId={setSwipeTargetId}
      setDraggedInput={setDraggedInput}
      setIsDraggingFromInputList={setIsDraggingFromInputList}
      setSelectedItem={setSelectedItem}
      setSelectSection={setSelectSection}
      setSections={setSections}
      getDefaultGridSize={getDefaultGridSize}
      deepCloneInputs={deepCloneInputs}
      genrateUID={genrateUID}
      generateUniqueInputName={generateUniqueInputName}
      handleFieldOnChange={handleFieldOnChange}
      handleQuickCreate={handleQuickCreate}
      handleRequired={handleRequired}
      handleViewable={handleViewable}
      handleRemoveField={handleRemoveField}
      group={group}
      duplicateField={duplicateField}
      selectItem={selectItem}
      selectSection={selectSection}
      normalizedGroup={normalizedGroup}
      formId={formId}
      fromDetail={fromDetail}
      setFormDetail={setFormDetail}
      setDuplicateField={setDuplicateField}
      buildFormBuilderPath={buildFormBuilderPath}
      subSectionPropertiesModal={subSectionPropertiesModal}
      tempSubSectionProps={tempSubSectionProps}
      setTempSubSectionProps={setTempSubSectionProps}
      closeSubSectionProperties={closeSubSectionProperties}
      saveSubSectionProperties={saveSubSectionProperties}
      deleteConfirmModal={deleteConfirmModal}
      closeDeleteConfirmation={closeDeleteConfirmation}
      confirmDelete={confirmDelete}
    />
  );

};

export default FormBuilder;
