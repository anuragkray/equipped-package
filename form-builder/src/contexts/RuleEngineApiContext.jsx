import React, { createContext, useContext } from 'react';

const RuleEngineApiContext = createContext(null);

export const RuleEngineApiProvider = ({ value, children }) => (
  <RuleEngineApiContext.Provider value={value ?? null}>
    {children}
  </RuleEngineApiContext.Provider>
);

export const useRuleEngineApiClient = () => useContext(RuleEngineApiContext);
