import AIAssistantClientPage from './ClientPage';
import AIAssistantContextProvider from './ContextProvider';

export default function AIAssistantPage() {
  return (
    <AIAssistantContextProvider>
      <AIAssistantClientPage />
    </AIAssistantContextProvider>
  );
}
