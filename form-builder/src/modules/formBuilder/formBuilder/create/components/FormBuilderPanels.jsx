import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash, DotsSixVertical, Gear } from "@phosphor-icons/react";
import InputList from "../inputlist";
import SaveForm from "../saveForm/SaveForm";
import Button from "../../../../../components/ui/button/Button.jsx";
import Card from "../../../../../components/custom/card/index.jsx";
import { InputField } from "../../../../../components/inputs/input/index.jsx";
import FieldConfig from "../fieldConfig/index";
import Properties from "../fieldConfig/properties";
import LookupConfig from "../fieldConfig/lookup";
import Modal from "../../../../../components/custom/modal/Modal.jsx";
const FormBuilderPanels = ({
  sections,
  addSection,
  handleInputDragEnd,
  handleInputDragStart,
  startDragAutoScroll,
  handleDragEndSection,
  handleSectionName,
  addSubSection,
  removeSection,
  hoveredSection,
  hoveredSubSection,
  handleDragOverSectionDropArea,
  handleDragSectionInputOver,
  handleDragSectionInput,
  handleSwipeInputInsideSection,
  handleSwipeInputInsideSubSection,
  addNestedSubSection,
  openSubSectionProperties,
  showDeleteConfirmation,
  handleSubSectionName,
  handleDragOverSubSection,
  draggedInput,
  isDraggingFromInputList,
  dropTargetRef,
  subsectionDropProcessedRef,
  isOverSubSectionRef,
  setHoveredSection,
  setHoveredSubSection,
  swipeTargetId,
  setSwipeTargetId,
  setDraggedInput,
  setIsDraggingFromInputList,
  setSelectedItem,
  setSelectSection,
  setSections,
  getDefaultGridSize,
  deepCloneInputs,
  genrateUID,
  generateUniqueInputName,
  handleFieldOnChange,
  handleQuickCreate,
  handleRequired,
  handleViewable,
  handleRemoveField,
  group,
  duplicateField,
  selectItem,
  selectSection,
  normalizedGroup,
  formId,
  fromDetail,
  setFormDetail,
  setDuplicateField,
  buildFormBuilderPath,
  subSectionPropertiesModal,
  tempSubSectionProps,
  setTempSubSectionProps,
  closeSubSectionProperties,
  saveSubSectionProperties,
  deleteConfirmModal,
  closeDeleteConfirmation,
  confirmDelete,
}) => {
  return (
    <div className="relative flex flex-col gap-2 form-builder-wrapper">
      <div className="mb-1 flex justify-between items-center">
        <h6 className="font-semibold property-label">
          Form for {normalizedGroup}
        </h6>
        <div className="flex justify-start items-center space-x-2">
          <Link to={buildFormBuilderPath(`?group=${normalizedGroup}`)}>
            <Button className="back-button-gray">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </Link>
          <SaveForm
            setDuplicateField={setDuplicateField}
            group={normalizedGroup}
            formId={formId}
            sections={sections}
            fromDetail={fromDetail}
            setFormDetail={setFormDetail}
          />
        </div>
      </div>
      <div className="w-full shadow rounded-md flex gap-3 justify-start p-3 form-builder-main-container">
        {/* Left Panel: Input List */}
        <div className="flex flex-col min-w-[200px] form-builder-left-panel">
          <Button onClick={addSection} className="dynamic-module-list-new-btn">
            <Plus size={16} style={{ marginRight: '4px' }} weight="regular" /> Section
          </Button>
          <InputList
            handleInputDragEnd={handleInputDragEnd}
            handleInputDragStart={handleInputDragStart}
          />
        </div>

        {/* Right Panel: Sections */}
        <div className="flex-1 grid gap-1 grid-cols-3 form-builder-sections-container">
          {sections.map((section, sectionIndex) => (
            <Card className="rounded-md shadow form-builder-section-card" key={section?.id}>
              <div
                draggable
                id="section"
                onDragStart={() => startDragAutoScroll()}
                onDragEnd={(e) => handleDragEndSection(e, section)}
              >
                {/* Section Header */}
                <div className="flex justify-between items-center gap-4 text-textBrandSecondary font-[400] bg-surfaceControlHeader border-b border-surfaceControlSelected dark:border-0 dark:bg-textBrandSecondary dark:text-[#ffff] px-3 py-2 rounded-t-md section-header-minerva">
                  <InputField
                    value={section.sectionsTitle}
                    placeholder="Section Name"
                    className="text-sm py-1.5 px-2 rounded-md bg-white/90 border border-gray-200 transition duration-300 ease focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 section-name-input-minerva flex-1"
                    onChange={(e) => handleSectionName(e.target.value, sectionIndex)}
                    onBlur={(e) => handleSectionName(e.target.value.trim(), sectionIndex)}
                  />
                  <div className="flex justify-start items-center gap-2 section-header-actions-minerva flex-shrink-0">
                    <button
                      onClick={() => addSubSection(sectionIndex)}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 text-white rounded-md shadow-sm hover:shadow-lg transition-all duration-200"
                      style={{ background: 'linear-gradient(180deg, var(--surface-nav-selected2-color, #308BE0) 0%, var(--surface-nav-selected1-color, #AFD2F3) 100%)' }}
                      title="Add Sub-Section"
                    >
                      <Plus size={14} weight="bold" />
                      <span>Sub-Section</span>
                    </button>
                    <button
                      disabled={section?.canRemove === false}
                      onClick={() => removeSection(section?.id)}
                      className="section-delete-button-minerva p-1.5 rounded hover:bg-red-100/50 transition-colors"
                      title="Delete Section"
                    >
                      <Trash size={18} weight="bold" className="dark:text-gray-300 text-red-500 hover:text-red-600" />
                    </button>
                    <DotsSixVertical size={20} weight="bold" className="dark:text-gray-300 text-gray-400 cursor-grab section-drag-handle-minerva" />
                  </div>
                </div>
                {/* Section Inputs */}
                <div
                  className={`border border-dashed transition-all duration-200 ${hoveredSection?.id === section?.id && !hoveredSubSection ? "border-blue-500 border-2 bg-blue-50 shadow-lg ring-2 ring-blue-200" : "border-gray-400"} my-2 w-full p-2 rounded-md section-inputs-area-minerva`}
                  onDragOver={(e) => handleDragOverSectionDropArea(e, section)}
                  onDragEnter={(e) => {
                    // Only handle if not over a sub-section
                    const isOverSubSection = e.target.closest('.form-builder-sub-section') !== null ||
                      e.target.closest('[data-subsection-drop-area]') !== null;
                    if (isOverSubSection) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                  }}
                  onDrop={(e) => {
                    // CRITICAL: Prevent section drop if we're dropping into a subsection
                    const isOverSubSection = e.target.closest('.form-builder-sub-section') !== null ||
                      e.target.closest('[data-subsection-drop-area]') !== null;
                    if (isOverSubSection || dropTargetRef.current) {
                      // If dropping into subsection, prevent section from handling it
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    // If dropping into section (not subsection), allow it
                    e.preventDefault();
                  }}
                >
                  {Object.entries(section?.inputs || {})?.map(([inputKey, input]) => {
                    if (input.type === 'SubSection') {
                      return (
                        <div
                          draggable
                          id={`section-${inputKey}`}
                          key={inputKey}
                          onDragOver={(e) => handleDragSectionInputOver(e, inputKey)}
                          className={`form-builder-sub-section transition-all duration-200 ${swipeTargetId === inputKey ? 'bg-blue-400 p-2 animate-bounce' : ''} ${hoveredSubSection?.id === inputKey ? 'border-green-500 border-2 shadow-lg ring-2 ring-green-200 bg-green-50' : 'border-gray-300 bg-gray-50'} border cursor-grab p-2 rounded-md shadow-md mb-3 flex flex-col justify-start items-start`}
                          onDragStart={() => handleDragSectionInput(inputKey, input, section)}
                          onDragEnd={(e) => handleSwipeInputInsideSection(section, e)}
                        >
                          <div className="w-full flex justify-between items-center mb-2 border-b pb-2 gap-4">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <DotsSixVertical size={20} weight="bold" className="dark:text-gray-300 text-gray-400 cursor-grab flex-shrink-0" />
                              <InputField
                                value={input?.label || 'Sub-Section'}
                                placeholder="Sub-Section Name"
                                className="text-sm py-1.5 px-2 rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 font-semibold text-gray-700 flex-1"
                                onChange={(e) => handleSubSectionName(e.target.value, sectionIndex, inputKey)}
                                onBlur={(e) => handleSubSectionName(e.target.value.trim() || 'Sub-Section', sectionIndex, inputKey)}
                              />
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Add Nested Sub-Section Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addNestedSubSection(sectionIndex, inputKey);
                                }}
                                className="flex items-center gap-1 text-xs font-bold uppercase px-2 py-1 text-white rounded shadow-sm hover:shadow-lg transition-all duration-200"
                                style={{ background: 'linear-gradient(180deg, var(--surface-nav-selected2-color, #308BE0) 0%, var(--surface-nav-selected1-color, #AFD2F3) 100%)' }}
                                title="Add Nested Sub-Section"
                              >
                                <Plus size={12} weight="bold" />
                                <span>Sub</span>
                              </button>
                              <button
                                onClick={() => openSubSectionProperties(sectionIndex, inputKey)}
                                className="p-1.5 rounded hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                                title="Properties"
                              >
                                <Gear size={16} />
                              </button>
                              <button
                                onClick={() => showDeleteConfirmation(sectionIndex, inputKey)}
                                className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                                title="Delete Sub-Section"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>

                          <div
                            data-subsection-drop-area="true"
                            className={`w-full min-h-[100px] border border-dashed rounded p-2 transition-all duration-200 ${hoveredSubSection?.id === inputKey ? 'bg-green-50 border-green-500 border-2 shadow-lg ring-2 ring-green-200' : 'border-gray-300 bg-white'}`}
                            onDragOver={(e) => handleDragOverSubSection(e, section, inputKey)}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.nativeEvent) {
                                e.nativeEvent.stopImmediatePropagation();
                              }
                            }}
                            onDrop={async (e) => {
                              // Prevent any default drop behavior
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.nativeEvent) {
                                e.nativeEvent.stopImmediatePropagation();
                              }
                              
                              // CRITICAL: Process subsection drop DIRECTLY here
                              // Don't call handleInputDragEnd - it will be called by onDragEnd from InputList
                              // But we set a flag so handleInputDragEnd knows subsection was already processed
                              // Handle both InputList drags AND existing field drags (no modal popup)
                              if (draggedInput) {
                                // CRITICAL: Set flags IMMEDIATELY and SYNCHRONOUSLY before any async operations
                                // This prevents handleInputDragEnd (called from onDragEnd) from processing section
                                subsectionDropProcessedRef.current = true;
                                
                                // CRITICAL: Ensure all refs are set (they should already be set by handleDragOverSubSection)
                                // But set them again to be absolutely sure, in case handleDragOverSubSection wasn't called
                                dropTargetRef.current = inputKey;
                                isOverSubSectionRef.current = true;
                                
                                const subSectionId = inputKey;
                                const targetSection = section;
                                const isFromInputList = isDraggingFromInputList;
                                
                                // Store source location for existing field drags
                                const sourceFieldId = draggedInput?.id;
                                const sourceSectionId = draggedInput?.sourceSectionId;
                                const sourceSubSectionId = draggedInput?.sourceSubSectionId;
                                
                                // CRITICAL: Deep clone the draggedInput to avoid reference sharing
                                const clonedDraggedInput = JSON.parse(JSON.stringify(draggedInput));
                                
                                // For existing field drags, use existing ID; for InputList drags, generate new ID
                                const isExistingFieldDrag = !isFromInputList && sourceFieldId;
                                let newUId = isExistingFieldDrag ? sourceFieldId : `item-${genrateUID()}`;
                                const label = clonedDraggedInput?.label || clonedDraggedInput?.FieldLabel || clonedDraggedInput?.type || 'field';
                                // For existing fields, keep the same name; for new fields, generate unique name
                                const uniqueName = isExistingFieldDrag 
                                  ? (clonedDraggedInput?.name || generateUniqueInputName(label, sections, null))
                                  : generateUniqueInputName(label, sections, null);

                                // For NEW fields from InputList, open properties modal
                                // For existing field drags (moving), don't open modal
                                if (isFromInputList) {
                                  // Open properties modal for new field
                                  const newFieldForModal = {
                                    ...clonedDraggedInput,
                                    id: newUId,
                                    name: uniqueName,
                                    label: label,
                                    subSectionId: subSectionId, // Include subSectionId for proper saving
                                    gridSize:
                                      clonedDraggedInput?.gridSize ??
                                      getDefaultGridSize(clonedDraggedInput?.type || clonedDraggedInput?.FieldType),
                                    animationClass: "animate-new-input",
                                  };
                                  setSelectedItem(newFieldForModal);
                                  setSelectSection(targetSection);
                                } else {
                                }

                                // Clear state (but keep refs set for now)
                                setHoveredSection(null);
                                setHoveredSubSection(null);
                                setSwipeTargetId(null);
                                setDraggedInput(null);
                                setIsDraggingFromInputList(false);
                                // DON'T clear dropTargetRef or isOverSubSectionRef yet - let handleInputDragEnd check them first

                                // Add to sub-section and remove from source if moving existing field
                                setSections(prevSections => {
                                  // First, deep clone all sections to avoid mutations
                                  let updatedSections = prevSections.map(s => ({
                                    ...s,
                                    inputs: deepCloneInputs(s.inputs || {})
                                  }));
                                  
                                  // If moving an existing field, remove it from source location first
                                  if (isExistingFieldDrag && sourceFieldId) {
                                    updatedSections = updatedSections.map(s => {
                                      const clonedInputs = s.inputs;
                                      
                                      // Check if field is at section level
                                      if (clonedInputs[sourceFieldId]) {
                                        delete clonedInputs[sourceFieldId];
                                        return { ...s, inputs: clonedInputs };
                                      }
                                      
                                      // Check in sub-sections
                                      Object.keys(clonedInputs).forEach(subKey => {
                                        const subSection = clonedInputs[subKey];
                                        if (subSection?.type === 'SubSection' && subSection.inputs) {
                                          // Check at sub-section level
                                          if (subSection.inputs[sourceFieldId]) {
                                            delete subSection.inputs[sourceFieldId];
                                          }
                                          // Check in nested sub-sections
                                          Object.keys(subSection.inputs).forEach(nestedKey => {
                                            const nestedSub = subSection.inputs[nestedKey];
                                            if (nestedSub?.type === 'SubSection' && nestedSub.inputs?.[sourceFieldId]) {
                                              delete nestedSub.inputs[sourceFieldId];
                                            }
                                          });
                                        }
                                      });
                                      
                                      return { ...s, inputs: clonedInputs };
                                    });
                                  }
                                  
                                  // Now add to target sub-section
                                  return updatedSections.map(s => {
                                    if (s.id === targetSection?.id) {
                                      const clonedInputs = s.inputs;
                                      const subSection = clonedInputs[subSectionId];
                                      if (subSection && subSection.type === 'SubSection') {
                                        const newField = {
                                          ...clonedDraggedInput,
                                          id: newUId,
                                          name: uniqueName,
                                          label: label,
                                          gridSize:
                                            clonedDraggedInput?.gridSize ??
                                            getDefaultGridSize(
                                              clonedDraggedInput?.type || clonedDraggedInput?.FieldType
                                            ),
                                          animationClass: "animate-new-input",
                                        };
                                        
                                        // Deep clone and regenerate option IDs to ensure uniqueness
                                        if (Array.isArray(newField.options)) {
                                          newField.options = newField.options.map(opt => ({ ...opt, id: genrateUID() }));
                                        }
                                        
                                        // Remove source tracking properties
                                        delete newField.sourceSection;
                                        delete newField.sourceSectionId;
                                        delete newField.sourceSubSectionId;

                                        subSection.inputs = {
                                          ...(subSection.inputs || {}),
                                          [newUId]: newField
                                        };

                                        return {
                                          ...s,
                                          inputs: clonedInputs
                                        };
                                      }
                                    }
                                    return s;
                                  });
                                });

                                // Clear animation after timeout
                                setTimeout(() => {
                                  setSections(prevSections =>
                                    prevSections.map(s => {
                                      if (s.id === targetSection?.id) {
                                        // Deep clone to avoid reference issues
                                        const clonedInputs = deepCloneInputs(s.inputs || {});
                                        const subSection = clonedInputs[subSectionId];
                                        if (subSection && subSection.inputs && subSection.inputs[newUId]) {
                                          subSection.inputs[newUId] = {
                                                    ...subSection.inputs[newUId],
                                                    animationClass: "",
                                                    options: (subSection.inputs[newUId]?.type === 'Select' || subSection.inputs[newUId]?.type === 'Multiselect' || subSection.inputs[newUId]?.type === 'radio')
                                                      ? [{ id: genrateUID(), label: "Option 1", value: "1" }]
                                                      : subSection.inputs[newUId]?.options
                                          };
                                          return {
                                            ...s,
                                            inputs: clonedInputs
                                          };
                                        }
                                      }
                                      return s;
                                    })
                                  );
                                  // Reset flags after processing is complete
                                  // Clear refs after a delay to ensure handleInputDragEnd has checked them
                                  setTimeout(() => {
                                    dropTargetRef.current = null;
                                    isOverSubSectionRef.current = false;
                                    subsectionDropProcessedRef.current = false;
                                  }, 200);
                                }, 1000);
                              }
                            }}
                          >
                            {Object.entries(input.inputs || {})?.map(([subInputKey, subInput]) => {
                              if (subInput?.type === 'SubSection') {
                                return (
                                  <div
                                    draggable
                                    id={`nested-section-${subInputKey}`}
                                    key={subInputKey}
                                    onDragOver={(e) => handleDragSectionInputOver(e, subInputKey)}
                                    className={`form-builder-sub-section transition-all duration-200 ${swipeTargetId === subInputKey ? 'bg-blue-400 p-2 animate-bounce' : ''} ${hoveredSubSection?.id === subInputKey ? 'border-green-500 border-2 shadow-lg ring-2 ring-green-200 bg-green-50' : 'border-gray-300 bg-gray-50'} border cursor-grab p-2 rounded-md shadow-md mb-3 flex flex-col justify-start items-start`}
                                    onDragStart={(e) => {
                                      e.stopPropagation();
                                      handleDragSectionInput(subInputKey, subInput, section, inputKey);
                                    }}
                                    onDragEnd={(e) => handleSwipeInputInsideSubSection(section, inputKey, e)}
                                  >
                                    <div className="w-full flex justify-between items-center mb-2 border-b pb-2 gap-4">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <DotsSixVertical size={20} weight="bold" className="dark:text-gray-300 text-gray-400 cursor-grab flex-shrink-0" />
                                        <InputField
                                          value={subInput?.label || 'Sub-Section'}
                                          placeholder="Sub-Section Name"
                                          className="text-sm py-1.5 px-2 rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 font-semibold text-gray-700 flex-1"
                                          onChange={(e) => handleSubSectionName(e.target.value, sectionIndex, subInputKey, inputKey)}
                                          onBlur={(e) => handleSubSectionName(e.target.value.trim() || 'Sub-Section', sectionIndex, subInputKey, inputKey)}
                                        />
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Add Nested Sub-Section Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addNestedSubSection(sectionIndex, subInputKey, inputKey);
                                          }}
                                          className="flex items-center gap-1 text-xs font-bold uppercase px-2 py-1 text-white rounded shadow-sm hover:shadow-lg transition-all duration-200"
                                          style={{ background: 'linear-gradient(180deg, var(--surface-nav-selected2-color, #308BE0) 0%, var(--surface-nav-selected1-color, #AFD2F3) 100%)' }}
                                          title="Add Sub-Section Inside"
                                        >
                                          <Plus size={12} weight="bold" />
                                          <span>Sub</span>
                                        </button>
                                        <button
                                          onClick={() => openSubSectionProperties(sectionIndex, subInputKey, inputKey)}
                                          className="p-1.5 rounded hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                                          title="Properties"
                                        >
                                          <Gear size={16} />
                                        </button>
                                        <button
                                          onClick={() => showDeleteConfirmation(sectionIndex, subInputKey, inputKey)}
                                          className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                                          title="Delete Sub-Section"
                                        >
                                          <Trash size={16} />
                                        </button>
                                      </div>
                                    </div>

                                    <div
                                      data-subsection-drop-area="true"
                                      className={`w-full min-h-[100px] border border-dashed rounded p-2 transition-all duration-200 ${hoveredSubSection?.id === subInputKey ? 'bg-green-50 border-green-500 border-2 shadow-lg ring-2 ring-green-200' : 'border-gray-300 bg-white'}`}
                                      onDragOver={(e) => handleDragOverSubSection(e, section, subInputKey)}
                                      onDragEnter={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (e.nativeEvent) {
                                          e.nativeEvent.stopImmediatePropagation();
                                        }
                                      }}
                                      onDrop={async (e) => {
                                        // Handle drop into nested sub-section (2nd level)
                                        
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (e.nativeEvent) {
                                          e.nativeEvent.stopImmediatePropagation();
                                        }
                                        
                                        // Handle both InputList drags AND existing field drags
                                        if (draggedInput) {
                                          
                                          // Set flags to prevent parent handlers
                                          subsectionDropProcessedRef.current = true;
                                          dropTargetRef.current = subInputKey;
                                          isOverSubSectionRef.current = true;
                                          
                                          const nestedSubSectionId = subInputKey;
                                          const parentSubSectionId = inputKey;
                                          const targetSection = section;
                                          const isFromInputList = isDraggingFromInputList;
                                          
                                          // Store source location for existing field drags (to remove from source)
                                          const sourceFieldId = draggedInput?.id;
                                          const sourceSectionId = draggedInput?.sourceSectionId;
                                          const sourceSubSectionId = draggedInput?.sourceSubSectionId;
                                          
                                          // CRITICAL: Deep clone the dragged input to avoid reference sharing
                                          const clonedDraggedInput = JSON.parse(JSON.stringify(draggedInput));
                                          
                                          // For existing field drags, use existing ID; for InputList drags, generate new ID
                                          const isExistingFieldDrag = !isFromInputList && sourceFieldId;
                                          let newUId = isExistingFieldDrag ? sourceFieldId : `item-${genrateUID()}`;
                                          const label = clonedDraggedInput?.label || clonedDraggedInput?.FieldLabel || clonedDraggedInput?.type || 'field';
                                          // For existing fields, keep the same name; for new fields, generate unique name
                                          const uniqueName = isExistingFieldDrag 
                                            ? (clonedDraggedInput?.name || generateUniqueInputName(label, sections, null))
                                            : generateUniqueInputName(label, sections, null);

                                          // For NEW fields from InputList, open properties modal
                                          // For existing field drags (moving), don't open modal
                                          if (isFromInputList) {
                                            // Open properties modal for new field
                                            const newFieldForModal = {
                                              ...clonedDraggedInput,
                                              id: newUId,
                                              name: uniqueName,
                                              label: label,
                                              subSectionId: nestedSubSectionId, // Include nested subSectionId
                                              parentSubSectionId: parentSubSectionId, // Include parent subSectionId
                                              gridSize:
                                                clonedDraggedInput?.gridSize ??
                                                getDefaultGridSize(clonedDraggedInput?.type || clonedDraggedInput?.FieldType),
                                              animationClass: "animate-new-input",
                                            };
                                            setSelectedItem(newFieldForModal);
                                            setSelectSection(targetSection);
                                          } else {
                                          }

                                          // Clear state
                                          setHoveredSection(null);
                                          setHoveredSubSection(null);
                                          setSwipeTargetId(null);
                                          setDraggedInput(null);
                                          setIsDraggingFromInputList(false);

                                          // Add field to nested sub-section (2nd level) and remove from source if moving existing field
                                          setSections(prevSections => {
                                            // First, deep clone all sections to avoid mutations
                                            let updatedSections = prevSections.map(s => ({
                                              ...s,
                                              inputs: deepCloneInputs(s.inputs || {})
                                            }));
                                            
                                            // If moving an existing field, remove it from source location first
                                            if (isExistingFieldDrag && sourceFieldId) {
                                              updatedSections = updatedSections.map(s => {
                                                const clonedInputs = s.inputs;
                                                
                                                // Check if field is at section level
                                                if (clonedInputs[sourceFieldId]) {
                                                  delete clonedInputs[sourceFieldId];
                                                  return { ...s, inputs: clonedInputs };
                                                }
                                                
                                                // Check in sub-sections
                                                Object.keys(clonedInputs).forEach(subKey => {
                                                  const subSection = clonedInputs[subKey];
                                                  if (subSection?.type === 'SubSection' && subSection.inputs) {
                                                    // Check at sub-section level
                                                    if (subSection.inputs[sourceFieldId]) {
                                                      delete subSection.inputs[sourceFieldId];
                                                    }
                                                    // Check in nested sub-sections
                                                    Object.keys(subSection.inputs).forEach(nestedKey => {
                                                      const nestedSub = subSection.inputs[nestedKey];
                                                      if (nestedSub?.type === 'SubSection' && nestedSub.inputs?.[sourceFieldId]) {
                                                        delete nestedSub.inputs[sourceFieldId];
                                                      }
                                                    });
                                                  }
                                                });
                                                
                                                return { ...s, inputs: clonedInputs };
                                              });
                                            }
                                            
                                            // Now add the field to the target nested sub-section
                                            return updatedSections.map(s => {
                                              if (s.id === targetSection?.id) {
                                                const clonedInputs = s.inputs;
                                                const parentSubSection = clonedInputs[parentSubSectionId];
                                                if (parentSubSection?.type === 'SubSection') {
                                                  const nestedSubSection = parentSubSection.inputs?.[nestedSubSectionId];
                                                  if (nestedSubSection?.type === 'SubSection') {
                                                    // CRITICAL: Create a completely fresh field object
                                                    const newField = {
                                                      ...clonedDraggedInput,
                                                      id: newUId,
                                                      name: uniqueName,
                                                      label: label,
                                                      gridSize:
                                                        clonedDraggedInput?.gridSize ??
                                                        getDefaultGridSize(
                                                          clonedDraggedInput?.type || clonedDraggedInput?.FieldType
                                                        ),
                                                      animationClass: "animate-new-input",
                                                    };
                                                    
                                                    // Deep clone options array if present
                                                    if (Array.isArray(newField.options)) {
                                                      newField.options = newField.options.map(opt => ({ ...opt, id: genrateUID() }));
                                                    }
                                                    
                                                    // Remove source tracking properties
                                                    delete newField.sourceSection;
                                                    delete newField.sourceSubSectionId;

                                                    nestedSubSection.inputs = {
                                                      ...(nestedSubSection.inputs || {}),
                                                      [newUId]: newField
                                                    };
                                                    return {
                                                      ...s,
                                                      inputs: clonedInputs
                                                    };
                                                  } else {
                                                  }
                                                } else {
                                                }
                                              }
                                              return s;
                                            });
                                          });

                                          // Clear animation after timeout
                                          setTimeout(() => {
                                            setSections(prevSections =>
                                              prevSections.map(s => {
                                                if (s.id === targetSection?.id) {
                                                  const clonedInputs = deepCloneInputs(s.inputs || {});
                                                  const parentSubSection = clonedInputs[parentSubSectionId];
                                                  if (parentSubSection?.inputs?.[nestedSubSectionId]) {
                                                    const nestedSubSection = parentSubSection.inputs[nestedSubSectionId];
                                                    if (nestedSubSection?.inputs?.[newUId]) {
                                                      nestedSubSection.inputs[newUId] = {
                                                        ...nestedSubSection.inputs[newUId],
                                                        animationClass: "",
                                                      };
                                                      return {
                                                        ...s,
                                                        inputs: clonedInputs
                                                      };
                                                    }
                                                  }
                                                }
                                                return s;
                                              })
                                            );
                                            // Reset flags
                                            setTimeout(() => {
                                              dropTargetRef.current = null;
                                              isOverSubSectionRef.current = false;
                                              subsectionDropProcessedRef.current = false;
                                            }, 200);
                                          }, 1000);
                                        }
                                      }}
                                    >
                                      {Object.entries(subInput.inputs || {})?.map(([nestedKey, nestedInput]) => {
                                        // Render deep nested sub-sections
                                        if (nestedInput?.type === 'SubSection') {
                                          return (
                                            <div
                                              draggable
                                              id={`deep-nested-section-${nestedKey}`}
                                              key={nestedKey}
                                              onDragOver={(e) => handleDragSectionInputOver(e, nestedKey)}
                                              className={`form-builder-sub-section transition-all duration-200 ${swipeTargetId === nestedKey ? 'bg-blue-400 p-2 animate-bounce' : ''} ${hoveredSubSection?.id === nestedKey ? 'border-green-500 border-2 shadow-lg ring-2 ring-green-200 bg-green-50' : 'border-purple-300 bg-purple-50'} border cursor-grab p-2 rounded-md shadow-md mb-3 flex flex-col justify-start items-start`}
                                              onDragStart={(e) => {
                                                e.stopPropagation();
                                                handleDragSectionInput(nestedKey, nestedInput, section, subInputKey);
                                              }}
                                              onDragEnd={(e) => handleSwipeInputInsideSubSection(section, subInputKey, e)}
                                            >
                                              {/* Deep Nested Sub-Section Header */}
                                              <div className="w-full flex justify-between items-center mb-2 border-b pb-1">
                                                <div className="flex items-center gap-2 flex-1">
                                                  <DotsSixVertical size={16} weight="bold" className="text-gray-400" />
                                                  <InputField
                                                    value={nestedInput?.label || 'Sub-Section'}
                                                    placeholder="Sub-Section Name"
                                                    className="text-xs py-1 px-1 rounded-md bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-300 font-semibold text-gray-600"
                                                    onChange={(e) => handleSubSectionName(e.target.value, sectionIndex, nestedKey, subInputKey)}
                                                    onBlur={(e) => handleSubSectionName(e.target.value.trim() || 'Sub-Section', sectionIndex, nestedKey, subInputKey)}
                                                  />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <button
                                                    onClick={() => openSubSectionProperties(sectionIndex, nestedKey, subInputKey)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Properties"
                                                  >
                                                    <Gear size={14} />
                                                  </button>
                                                  <button
                                                    onClick={() => handleRemoveField(sectionIndex, nestedKey, subInputKey, inputKey)}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Delete"
                                                  >
                                                    <Trash size={14} />
                                                  </button>
                                                </div>
                                              </div>
                                              
                                              {/* Deep Nested Content */}
                                              <div
                                                className="w-full min-h-[60px] border border-dashed rounded p-2 border-purple-200 bg-white"
                                              >
                                                {Object.entries(nestedInput.inputs || {})?.map(([deepKey, deepInput]) => (
                                                  <div
                                                    key={deepKey}
                                                    className={`${deepInput?.removeAble ? '' : 'bg-gray-200'} border cursor-grab p-1.5 rounded-md shadow-sm mb-2 flex justify-between items-center border-gray-200 ${deepInput?.animationClass || ''} field-item-minerva text-xs`}
                                                  >
                                                    <div className="w-full flex items-center gap-1">
                                                      <DotsSixVertical size={14} className="text-gray-400" />
                                                      <span className="text-gray-600 truncate">{deepInput?.label || 'Field'}</span>
                                                    </div>
                                                    <button
                                                      onClick={() => handleRemoveField(sectionIndex, deepKey, nestedKey)}
                                                      className="text-red-400 hover:text-red-600"
                                                    >
                                                      <Trash size={12} />
                                                    </button>
                                                  </div>
                                                ))}
                                                {(!nestedInput.inputs || Object.keys(nestedInput.inputs).length === 0) && (
                                                  <p className="text-gray-400 text-xs text-center p-2">Drop fields here</p>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        }
                                        
                                        // Render regular fields inside nested sub-section
                                        return (
                                        <div
                                          draggable
                                          id={`nested-subsection-${nestedKey}`}
                                          key={nestedKey}
                                          onDragOver={(e) => handleDragSectionInputOver(e, nestedKey)}
                                          className={`${nestedInput?.removeAble ? '' : 'bg-gray-200 dark:bg-transparent'} ${swipeTargetId === nestedKey ? 'bg-blue-400 p-2 animate-bounce' : ''} border cursor-grab p-2 rounded-md shadow-sm mb-2 flex justify-between items-center border-gray-200 ${nestedInput?.animationClass || ''} field-item-minerva`}
                                          onDragStart={(e) => {
                                            e.stopPropagation();
                                            handleDragSectionInput(nestedKey, nestedInput, section, subInputKey);
                                          }}
                                          onDragEnd={(e) => handleSwipeInputInsideSubSection(section, subInputKey, e)}
                                        >
                                          <div className="w-full flex justify-start items-center space-x-2 field-content-minerva">
                                            <DotsSixVertical size={20} weight="bold" className="dark:text-gray-300 text-2xl text-textBrandSecondary field-drag-handle-minerva" />
                                            <InputField
                                              disabled={!nestedInput?.removeAble}
                                              value={nestedInput?.label || ""}
                                              placeholder="Field Label"
                                              id={nestedKey}
                                                onChange={(e) => handleFieldOnChange(e, section, subInputKey, inputKey)}
                                              name="label"
                                              className="dark:text-gray-300/90 w-full text-sm rounded-md bg-transparent transition duration-300 ease focus:outline-none focus:none field-label-input-minerva"
                                            />
                                          </div>
                                          <FieldConfig
                                            hooksAndValue={{
                                              field: nestedInput,
                                              sectionIndex,
                                              inputKey: nestedKey,
                                              section,
                                                handleQuickCreate: (id, quick, sec, subSecId) => handleQuickCreate(id, quick, sec, subInputKey, inputKey),
                                                handleRequired: (id, req, sec, subSecId) => handleRequired(id, req, sec, subInputKey, inputKey),
                                                handleViewable: (id, isViewable, sec, subSecId) => handleViewable(id, isViewable, sec, subInputKey, inputKey),
                                                handleRemoveField: (sIdx, iKey) => handleRemoveField(sIdx, iKey, subInputKey, inputKey),
                                              setSelectedItem,
                                              setSelectSection,
                                              setSections,
                                                subSectionId: subInputKey,
                                                parentSubSectionId: inputKey, // Pass parent sub-section ID for nested sub-section fields
                                                sections
                                              }}
                                              group={group}
                                            />
                                          </div>
                                        );
                                      })}
                                      {(!subInput.inputs || Object.keys(subInput.inputs).length === 0) && (
                                        <p className="text-gray-400 text-xs text-center p-4">Drop fields or subsections here</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  draggable
                                  id={`subsection-${subInputKey}`}
                                  key={subInputKey}
                                  onDragOver={(e) => handleDragSectionInputOver(e, subInputKey)}
                                  className={`${subInput?.removeAble ? '' : 'bg-gray-200 dark:bg-transparent'} ${swipeTargetId === subInputKey ? 'bg-blue-400 p-2 animate-bounce' : ''} border cursor-grab p-2 rounded-md shadow-sm mb-2 flex justify-between items-center border-gray-200 ${subInput?.animationClass || ''} field-item-minerva`}
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    handleDragSectionInput(subInputKey, subInput, section, inputKey);
                                  }}
                                  onDragEnd={(e) => handleSwipeInputInsideSubSection(section, inputKey, e)}
                                >
                                  <div className="w-full flex justify-start items-center space-x-2 field-content-minerva">
                                    <DotsSixVertical size={20} weight="bold" className="dark:text-gray-300 text-2xl text-textBrandSecondary field-drag-handle-minerva" />
                                    <InputField
                                      disabled={!subInput?.removeAble}
                                      value={subInput?.label || ""}
                                      placeholder="Field Label"
                                      id={subInputKey}
                                      onChange={(e) => handleFieldOnChange(e, section, inputKey)}
                                      name="label"
                                      className="dark:text-gray-300/90 w-full text-sm rounded-md bg-transparent transition duration-300 ease focus:outline-none focus:none field-label-input-minerva"
                                    />
                                  </div>
                                  <FieldConfig
                                    hooksAndValue={{
                                      field: subInput,
                                      sectionIndex,
                                      inputKey: subInputKey,
                                      section,
                                      handleQuickCreate,
                                      handleRequired,
                                      handleViewable,
                                      handleRemoveField: (sIdx, iKey) => handleRemoveField(sIdx, iKey, inputKey),
                                      setSelectedItem,
                                      setSelectSection,
                                      setSections,
                                      subSectionId: inputKey, // Pass the subsection ID so Properties knows this is a subsection input
                                      sections
                                    }}
                                    group={group}
                                  />
                                </div>
                              );
                            })}
                            {(!input.inputs || Object.keys(input.inputs).length === 0) && (
                              <p className="text-gray-400 text-xs text-center p-4">Drop fields here</p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div
                        draggable
                        id={`section-${inputKey}`}
                        key={inputKey}
                        onDragOver={(e) => handleDragSectionInputOver(e, inputKey)}
                        className={`${input?.removeAble ? '' : 'bg-gray-200 dark:bg-transparent'} ${swipeTargetId === inputKey ? 'bg-blue-400 p-2 animate-bounce' : ''} border cursor-grab p-2 rounded-md shadow-md mb-3 flex justify-between items-center border-gray-200 ${duplicateField[input?.label] > 1 ? 'bg-red-400' : ''} ${input?.animationClass || ''} field-item-minerva`}
                        onDragStart={() => handleDragSectionInput(inputKey, input, section)}
                        onDragEnd={(e) => handleSwipeInputInsideSection(section, e)}
                      >
                        <div className="w-full flex justify-start items-center space-x-2 field-content-minerva">
                          <DotsSixVertical size={20} weight="bold" className="dark:text-gray-300 text-2xl text-textBrandSecondary field-drag-handle-minerva" />
                          <InputField
                            disabled={!input?.removeAble}
                            value={input?.label || ""}
                            placeholder="Field Label"
                            id={inputKey}
                            onChange={(e) => handleFieldOnChange(e, section)}
                            name="label"
                            className="dark:text-gray-300/90 w-full text-sm rounded-md bg-transparent transition duration-300 ease focus:outline-none focus:none field-label-input-minerva"
                          />
                        </div>
                        <FieldConfig
                          hooksAndValue={{
                            field: input,
                            sectionIndex,
                            inputKey,
                            section,
                            handleQuickCreate,
                            handleRequired,
                            handleViewable,
                            handleRemoveField,
                            setSelectedItem,
                            setSelectSection,
                            setSections,
                            sections
                          }}
                          group={group}
                        />
                      </div>
                    );
                  })}
                  <p className="text-gray-500 text-sm text-center section-drop-hint-minerva">Drag and drop fields here</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {selectItem && selectItem?.type !== 'Lookup' && (
          <Properties
            selectItem={selectItem}
            setSections={setSections}
            section={selectSection}
            sectionsList={sections}
            setSelectedItem={setSelectedItem}
            subSectionId={selectItem?.subSectionId}
          />
        )}
        {selectItem && selectItem?.type === 'Lookup' && (
          <LookupConfig
            selectItem={selectItem}
            setSelectedItem={setSelectedItem}
            setSections={setSections}
            section={selectSection}
            sectionsList={sections}
          />
        )}
      </div>

      {/* Sub-Section Properties Modal */}
      {subSectionPropertiesModal.isOpen && tempSubSectionProps && (
        <Modal
          isOpen={subSectionPropertiesModal.isOpen}
          onClose={closeSubSectionProperties}
          title="Sub-Section Properties"
          className="w-[90%] lg:w-1/2"
        >
          <div className="p-4">
            {(() => {
              const section = sections[subSectionPropertiesModal.sectionIndex];
              const { subSectionId, parentSubSectionId } = subSectionPropertiesModal;
              
              // Handle nested sub-section
              let subSection;
              if (parentSubSectionId) {
                const parentSubSection = section?.inputs[parentSubSectionId];
                subSection = parentSubSection?.inputs?.[subSectionId];
              } else {
                subSection = section?.inputs[subSectionId];
              }

              if (!subSection) return null;

              // Get all Select/Radio/Checkbox fields from ALL sections for conditional display
              // INCLUDING fields inside SubSections (nested) - RECURSIVE scanning for all levels
              const conditionalDisplayCandidates = [];
              
              // Recursive function to scan fields inside SubSections at any nesting level
              const scanFieldsRecursively = (inputs, pathPrefix, excludeId = null) => {
                Object.entries(inputs || {}).forEach(([id, input]) => {
                  if (!input || id === excludeId) return;
                  
                  const inputType = (input?.type || '').toLowerCase();
                  
                  // If this is a SubSection, scan its contents recursively
                  if (inputType === 'subsection') {
                    const subSectionLabel = input?.label || 'Untitled SubSection';
                    const newPath = `${pathPrefix} → ${subSectionLabel}`;
                    
                    // Recursively scan inside this SubSection
                    scanFieldsRecursively(input?.inputs, newPath, subSectionPropertiesModal.subSectionId);
                  } else {
                    // This is a regular field - check if it's a candidate for conditional display
                    
                    // Handle fields with options (select, multiselect, radio)
                    if (['select', 'multiselect', 'radio'].includes(inputType)) {
                      const options = input?.options || [];
                      if (options.length > 0) {
                        conditionalDisplayCandidates.push({
                          id,
                          label: input?.label || 'Untitled',
                          name: input?.name || '',
                          type: inputType,
                          options: options,
                          sectionTitle: pathPrefix,
                          isFromSubSection: pathPrefix.includes('→'),
                        });
                      }
                    }
                    
                    // Handle checkbox fields (boolean)
                    if (inputType === 'checkbox') {
                      conditionalDisplayCandidates.push({
                        id,
                        label: input?.label || 'Untitled',
                        name: input?.name || '',
                        type: inputType,
                        isBoolean: true,
                        sectionTitle: pathPrefix,
                        isFromSubSection: pathPrefix.includes('→'),
                      });
                    }
                  }
                });
              };
              
              // Scan all sections
              sections.forEach((sec, secIdx) => {
                const sectionTitle = sec?.sectionsTitle || 'Untitled Section';
                
                // Scan fields in this section (including nested SubSections recursively)
                scanFieldsRecursively(sec?.inputs, sectionTitle, subSectionPropertiesModal.subSectionId);
              });

              // Handle conditional display toggle - update temp state
              const handleConditionalDisplayToggle = (checked) => {
                if (checked && conditionalDisplayCandidates.length > 0) {
                  const first = conditionalDisplayCandidates[0];
                  setTempSubSectionProps(prev => ({
                    ...prev,
                    conditionalDisplay: {
                      enabled: true,
                      fieldId: first.id,
                      fieldName: first.name,
                      fieldLabel: first.label,
                      selectedOptions: [],
                    }
                  }));
                } else {
                  setTempSubSectionProps(prev => ({
                    ...prev,
                    conditionalDisplay: { enabled: false }
                  }));
                }
              };

              // Handle field selection change - update temp state
              const handleFieldChange = (fieldId) => {
                const selectedField = conditionalDisplayCandidates.find(c => c.id === fieldId);
                if (selectedField) {
                  setTempSubSectionProps(prev => ({
                    ...prev,
                    conditionalDisplay: {
                      ...prev.conditionalDisplay,
                      fieldId: selectedField.id,
                      fieldName: selectedField.name,
                      fieldLabel: selectedField.label,
                      selectedOptions: [],
                    }
                  }));
                }
              };

              // Handle option selection - update temp state
              const handleOptionToggle = (optionValue) => {
                const currentOptions = tempSubSectionProps.conditionalDisplay?.selectedOptions || [];
                const newOptions = currentOptions.includes(optionValue)
                  ? currentOptions.filter(o => o !== optionValue)
                  : [...currentOptions, optionValue];
                
                setTempSubSectionProps(prev => ({
                  ...prev,
                  conditionalDisplay: {
                    ...prev.conditionalDisplay,
                    selectedOptions: newOptions,
                  }
                }));
              };

              // Handle checkbox condition toggle - update temp state
              const handleCheckboxConditionToggle = (showWhenChecked) => {
                setTempSubSectionProps(prev => ({
                  ...prev,
                  conditionalDisplay: {
                    ...prev.conditionalDisplay,
                    showWhenChecked: showWhenChecked,
                  }
                }));
              };

              // Get selected field details
              const selectedField = conditionalDisplayCandidates.find(
                c => c.id === tempSubSectionProps.conditionalDisplay?.fieldId
              );

              // Custom toggle component with theme color
              const ThemeToggle = ({ checked, onChange, label }) => (
                <label className="inline-flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={onChange}
                      className="sr-only"
                    />
                    <div 
                      className={`w-11 h-6 rounded-full transition-all duration-200 ${checked ? '' : 'bg-gray-200'}`}
                      style={checked ? { background: 'linear-gradient(180deg, var(--surface-nav-selected2-color, #308BE0) 0%, var(--surface-nav-selected1-color, #AFD2F3) 100%)' } : {}}
                    >
                      <div 
                        className={`absolute top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full transition-all duration-200 ${checked ? 'left-[22px]' : 'left-[2px]'}`}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
                </label>
              );

              return (
                <div className="space-y-4">
                  {/* Show Add Button - hidden when saveAndAddMore is enabled */}
                  {!tempSubSectionProps.saveAndAddMore && (
                  <div className="w-full">
                    <label className="property-label mb-2 block">Show Add Button</label>
                    <ThemeToggle
                          checked={tempSubSectionProps.showAddButton || false}
                          onChange={(e) => setTempSubSectionProps(prev => ({
                            ...prev,
                            showAddButton: e.target.checked
                          }))}
                      label={tempSubSectionProps.showAddButton ? 'Yes' : 'No'}
                      />
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, an "Add" button will be shown in this sub-section
                    </p>
                  </div>
                  )}

                  {/* Save & Add More - hidden when showAddButton is enabled */}
                  {!tempSubSectionProps.showAddButton && (
                    <div className="w-full">
                      <label className="property-label mb-2 block">Save & Add More</label>
                      <ThemeToggle
                          checked={tempSubSectionProps.saveAndAddMore || false}
                          onChange={(e) => setTempSubSectionProps(prev => ({
                            ...prev,
                            saveAndAddMore: e.target.checked
                          }))}
                        label={tempSubSectionProps.saveAndAddMore ? 'Yes' : 'No'}
                        />
                      <p className="text-xs text-gray-500 mt-1">
                        When enabled, a "Save & Add More" button will be shown in this sub-section
                      </p>
                    </div>
                  )}

                  {/* Info message when one option is selected */}
                  {(tempSubSectionProps.showAddButton || tempSubSectionProps.saveAndAddMore) && (
                    <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      Note: "Show Add Button" and "Save & Add More" are mutually exclusive. 
                      Disable the current option to enable the other.
                    </p>
                  )}

                  {/* Conditional Display Section */}
                  <div className="w-full border-t pt-4 mt-4">
                    <label className="property-label mb-2 block">Conditional Display</label>
                    <div className="mb-3">
                      <ThemeToggle
                        checked={tempSubSectionProps.conditionalDisplay?.enabled || false}
                        onChange={(e) => handleConditionalDisplayToggle(e.target.checked)}
                        label={tempSubSectionProps.conditionalDisplay?.enabled ? 'Enabled' : 'Disabled'}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Show/hide this sub-section based on another field's value
                    </p>

                    {tempSubSectionProps.conditionalDisplay?.enabled && (
                      <div className="pl-4 border-l-2 border-blue-300 space-y-3">
                        {/* Field Selection */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Show this sub-section when:
                          </label>
                          <select
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            value={tempSubSectionProps.conditionalDisplay?.fieldId || ''}
                            onChange={(e) => handleFieldChange(e.target.value)}
                          >
                            <option value="">Select a field...</option>
                            {conditionalDisplayCandidates.map((candidate) => (
                              <option key={candidate.id} value={candidate.id}>
                                {candidate.label} ({candidate.sectionTitle})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Options Selection - for Select/Radio fields */}
                        {selectedField && !selectedField.isBoolean && selectedField.options && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-1">
                              Has any of these values:
                            </label>
                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                              {selectedField.options.map((option, idx) => {
                                const optionValue = option?.value || option?.label || option;
                                const optionLabel = option?.label || option?.value || option;
                                return (
                                  <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                      type="checkbox"
                                      checked={(tempSubSectionProps.conditionalDisplay?.selectedOptions || []).includes(optionValue)}
                                      onChange={() => handleOptionToggle(optionValue)}
                                      className="h-4 w-4 accent-blue-600"
                                    />
                                    <span>{optionLabel}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Checkbox Condition - for Boolean checkbox fields */}
                        {selectedField && selectedField.isBoolean && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 block mb-2">
                              Show sub-section when checkbox is:
                            </label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <span className={`text-sm font-medium ${tempSubSectionProps.conditionalDisplay?.showWhenChecked === false ? 'text-blue-600' : 'text-gray-400'}`}>
                                Unchecked
                              </span>
                              <label className="inline-flex items-center cursor-pointer">
                                <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={tempSubSectionProps.conditionalDisplay?.showWhenChecked === true}
                                  onChange={(e) => handleCheckboxConditionToggle(e.target.checked)}
                                    className="sr-only"
                                />
                                  <div 
                                    className={`w-11 h-6 rounded-full transition-all duration-200 ${tempSubSectionProps.conditionalDisplay?.showWhenChecked === true ? '' : 'bg-gray-200'}`}
                                    style={tempSubSectionProps.conditionalDisplay?.showWhenChecked === true ? { background: 'linear-gradient(180deg, var(--surface-nav-selected2-color, #308BE0) 0%, var(--surface-nav-selected1-color, #AFD2F3) 100%)' } : {}}
                                  >
                                    <div 
                                      className={`absolute top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full transition-all duration-200 ${tempSubSectionProps.conditionalDisplay?.showWhenChecked === true ? 'left-[22px]' : 'left-[2px]'}`}
                                    ></div>
                                  </div>
                                </div>
                              </label>
                              <span className={`text-sm font-medium ${tempSubSectionProps.conditionalDisplay?.showWhenChecked === true ? 'text-blue-600' : 'text-gray-400'}`}>
                                Checked
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Save/Cancel Buttons */}
                  <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                    <button
                      type="button"
                      onClick={closeSubSectionProperties}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveSubSectionProperties}
                      className="px-4 py-2 text-sm font-bold uppercase text-white rounded-md transition-all shadow-sm hover:shadow-lg"
                      style={{ background: 'linear-gradient(180deg, var(--surface-nav-selected2-color, #308BE0) 0%, var(--surface-nav-selected1-color, #AFD2F3) 100%)' }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </Modal>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && (
        <Modal
          isOpen={deleteConfirmModal.isOpen}
          onClose={closeDeleteConfirmation}
          title="Confirm Delete"
          className="w-[90%] lg:w-[400px]"
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete {deleteConfirmModal.type === 'subSection' ? 'Sub-Section' : 'Field'}?
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteConfirmModal.label}"</span>?
                {deleteConfirmModal.type === 'subSection' && (
                  <span className="block mt-1 text-red-600 text-xs">
                    All fields inside this sub-section will also be deleted.
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2"
              >
                <Trash size={16} />
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FormBuilderPanels;
