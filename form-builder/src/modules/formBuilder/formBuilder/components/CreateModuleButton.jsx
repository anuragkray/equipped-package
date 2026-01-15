import React, { useState } from 'react';
import Button from '../../../../components/ui/button/Button.jsx';
import Modal from '../../../../components/custom/modal/Modal.jsx';
import CreateModuleForm from './CreateModuleForm.jsx';

const CreateModuleButton = ({ formGroups }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={handleModalOpen} className="dynamic-module-list-new-btn">
        Create Module
      </Button>
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <CreateModuleForm formGroups={formGroups} onClose={handleModalClose} />
      </Modal>
    </>
  );
};

export default CreateModuleButton;

