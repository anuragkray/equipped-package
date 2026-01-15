# FileDropzone Module

A fully dynamic and reusable drag-and-drop file upload component designed to be controlled by parent components for API integration.

## Directory Structure

```
fileDropzone/
├── README.md                   # This file
├── FileDropzone.jsx            # Original monolithic component
├── FileDropzoneContainer.jsx   # Refactored modular component
├── FileDropzone.css            # Styles
├── FileViewModal.jsx           # File preview modal
├── FileViewModal.css           # Modal styles
├── components/                 # Sub-components
│   ├── Dropzone.jsx           # Drag-and-drop area
│   ├── FileList.jsx           # Uploaded files list
│   └── OCRToggle.jsx          # OCR toggle switch
├── hooks/                      # Custom React hooks
│   ├── useDragAndDrop.js      # Drag-and-drop logic
│   └── useFileModal.js        # Modal state management
└── utils/                      # Utility functions
    ├── fileValidation.js      # File validation logic
    └── fileFormatters.js      # Formatting utilities
```

## Usage

### Import the Component

```javascript
// Import the refactored component
import FileDropzoneContainer from '@/components/inputs/fileDropzone/FileDropzoneContainer';

// Or import the original component
import FileDropzone from '@/components/inputs/fileDropzone/FileDropzone';
```

### Basic Example

```javascript
import { FileDropzoneContainer } from '@/components/inputs/fileDropzone';

function MyComponent() {
  const [files, setFiles] = useState([]);

  const handleFilesSelected = (newFiles) => {
    // Handle file upload to API
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileRemove = (fileToRemove) => {
    // Handle file deletion from API
    setFiles(prev => prev.filter(f => f.id !== fileToRemove.id));
  };

  return (
    <FileDropzoneContainer
      files={files}
      onFilesSelected={handleFilesSelected}
      onFileRemove={handleFileRemove}
      acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
      maxFileSize={10}
      multiple={true}
    />
  );
}
```

## Using Individual Components, Hooks, and Utilities

You can import and use individual parts directly:

```javascript
// Import sub-components
import Dropzone from '@/components/inputs/fileDropzone/components/Dropzone';
import FileList from '@/components/inputs/fileDropzone/components/FileList';
import OCRToggle from '@/components/inputs/fileDropzone/components/OCRToggle';

// Import custom hooks
import { useDragAndDrop } from '@/components/inputs/fileDropzone/hooks/useDragAndDrop';
import { useFileModal } from '@/components/inputs/fileDropzone/hooks/useFileModal';

// Import utilities
import { validateFile, processFiles } from '@/components/inputs/fileDropzone/utils/fileValidation';
import { formatFileSize, formatTimeAgo } from '@/components/inputs/fileDropzone/utils/fileFormatters';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFilesSelected` | Function | - | Callback when new files are selected/dropped |
| `onFileRemove` | Function | - | Callback when user clicks remove button |
| `files` | Array | `[]` | Array of file objects controlled by parent |
| `acceptedFileTypes` | Array | - | Array of accepted MIME types |
| `maxFileSize` | Number | - | Maximum file size in MB |
| `multiple` | Boolean | `true` | Allow multiple file selection |
| `label` | String | - | Label for the dropzone |
| `dropzoneText` | String | - | Main text shown in dropzone |
| `buttonText` | String | - | Text for the browse button |
| `showOCRToggle` | Boolean | `false` | Show OCR toggle option |
| `ocrToggleText` | String | - | Text for OCR toggle |
| `ocrTooltip` | String | - | Tooltip text for OCR info icon |
| `onOCRToggle` | Function | - | Callback when OCR toggle changes |
| `disabled` | Boolean | `false` | Disable the dropzone |
| `uploadedSectionTitle` | String | - | Title for uploaded documents section |
| `viewButtonText` | String | - | Text for view button |
| `removeButtonText` | String | - | Text for remove button |
| `closeButtonText` | String | - | Text for modal close button |
| `statusLabels` | Object | - | Custom labels for file statuses |
| `mimeTypeMap` | Object | - | Custom MIME type to extension mapping |

## File Object Structure

```javascript
{
  id: string,           // Unique identifier
  file: File,          // Original File object
  name: string,        // File name
  size: number,        // File size in bytes
  type: string,        // MIME type
  uploadedAt: Date,    // Upload timestamp
  status: string       // 'uploaded' | 'processing' | 'processed' | 'error'
}
```

## Benefits of Modular Structure

- ✅ **Maintainability**: Each file has a single responsibility
- ✅ **Reusability**: Components and hooks can be used independently
- ✅ **Testability**: Smaller units are easier to test
- ✅ **Code Organization**: Clear separation of concerns
- ✅ **Explicit Imports**: Direct imports from specific files
- ✅ **Developer Experience**: Easier to navigate and understand

## Migration Guide

If you're using the original `FileDropzone.jsx`:

```javascript
// Before
import FileDropzone from './FileDropzone';

// After (refactored version - same API)
import FileDropzoneContainer from '@/components/inputs/fileDropzone/FileDropzoneContainer';

// Or keep using the original
import FileDropzone from '@/components/inputs/fileDropzone/FileDropzone';

// You can also alias it
import FileDropzoneContainer as FileDropzone from '@/components/inputs/fileDropzone/FileDropzoneContainer';
```

The refactored component maintains 100% API compatibility with the original.
