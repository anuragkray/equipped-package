import React, { createContext, useContext } from 'react';

const RuleEngineContext = createContext({
  apiClient: null,
  RuleEngineModal: null,
});

export const RuleEngineApiProvider = ({ apiClient, RuleEngineModal, children }) => (
  <RuleEngineContext.Provider value={{ apiClient: apiClient ?? null, RuleEngineModal: RuleEngineModal ?? null }}>
    {children}
  </RuleEngineContext.Provider>
);

export const useRuleEngineApiClient = () => useContext(RuleEngineContext).apiClient;

export const useRuleEngineComponent = () => useContext(RuleEngineContext).RuleEngineModal;
