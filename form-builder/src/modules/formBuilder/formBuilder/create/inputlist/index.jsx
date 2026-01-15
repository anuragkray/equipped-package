import React, { useEffect, useState } from "react";
import { DotsSixVertical } from "@phosphor-icons/react";
import { getInputFieldList } from "./data";
import './InputList.css';

const InputList = ({ handleInputDragEnd = () => {}, handleInputDragStart = () => {} }) => {
  const [inputFieldList, setInputFieldList] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInputFields = async () => {
      try {
        const fields = await getInputFieldList();
        setInputFieldList(fields);
      } catch (error) {
        // Fallback to basic fields if API fails
        const basicFields = await getInputFieldList(true);
        setInputFieldList(basicFields);
      } finally {
        setLoading(false);
      }
    };

    loadInputFields();
  }, []);

  if (loading) {
    return (
      <div className="input-list-container">
        <div className="input-list-loading">Loading inputs...</div>
      </div>
    );
  }

  return (
    <div className="input-list-container">
      {Object.keys(inputFieldList)?.map((inp) => {
        const field = inputFieldList[inp];
        return (
          <div
            draggable
            key={inp}
            onDragStart={(e) => handleInputDragStart(e, field, inp)}
            onDragEnd={() => handleInputDragEnd(field, inp)}
            className="input-list-item"
          >
            <span className="input-list-label">
              {field?.type} <sup className="input-list-sup">({field?.label})</sup>
            </span>
            <DotsSixVertical weight="bold" className="input-list-drag" />
          </div>
        );
      })}
    </div>
  );
};

export default InputList;

