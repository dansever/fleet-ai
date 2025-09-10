'use client';

import { createContext, useState } from 'react';

export type AIAssistantContextType = {
  conversations: any[];
  setConversations: (conversations: any[]) => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
};

export const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export default function AIAssistantContextProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  const values = {
    conversations,
    setConversations,
    selectedId,
    setSelectedId,
  };

  return <AIAssistantContext.Provider value={values}>{children}</AIAssistantContext.Provider>;
}
