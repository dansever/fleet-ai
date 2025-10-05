# Airport Hub Components

## Contract Files Component

The main component for viewing and interacting with contract documents.

### Recent Updates

#### Improved Extracted Data Presentation (Latest)

**Before:**

- Long vertical list of card components
- Source quotes always visible
- Cluttered and hard to scan
- No AI integration

**After:**

- Compact table layout with Term | Value | Actions columns
- Source quotes hidden by default, expandable via accordion
- AI Insights section at the top showing:
  - Contract expiration warnings
  - Potential savings opportunities
  - Risk alerts
- Integrated AI Assistant in all tabs
- Better visual hierarchy and scannability

#### AI Assistant Integration

The AI Assistant is now deeply integrated into the document viewing experience:

1. **Floating Mode** (Bottom-right corner)
   - Always accessible when viewing a document
   - Shows badge with number of insights
   - Expands into full chat interface
   - Follows user across tabs

2. **Inline Mode** (Within tabs)
   - Summary Tab: Shows key highlights
   - Extracted Data Tab: Shows AI insights section
   - Content Tab: Available for content-specific queries

3. **Features**
   - AI-generated insights with color coding
   - Chat interface for asking questions
   - Suggested questions to get started
   - Context-aware responses (once implemented)

### Components

- `ContractFiles.tsx` - Main document viewer
- `AIAssistant.tsx` - AI assistant component with multiple display modes

### Key Improvements

1. **Compact Data Presentation**
   - Table-style layout instead of card list
   - Better use of horizontal space
   - Easier to scan and compare terms

2. **Progressive Disclosure**
   - Quotes hidden by default
   - Expand icon to reveal source text
   - Accordion animation for smooth UX

3. **AI-First Approach**
   - AI insights prominently displayed
   - Chat interface integrated naturally
   - Not relegated to separate tab
   - Context-aware assistance

4. **Better Search**
   - Search across term keys AND values
   - Sticky search bar
   - Real-time filtering

### Usage Example

```tsx
// Floating AI Assistant
<AIAssistant
  mode="floating"
  context={{
    documentId: selectedDocument.id,
    contractId: selectedContract?.id,
    documentName: selectedDocument.fileName,
  }}
  insights={[
    {
      type: 'expiration',
      title: 'Contract Expiration',
      description: 'This contract expires in 45 days.',
    },
  ]}
/>

// Inline AI Assistant
<AIAssistant
  mode="inline"
  context={{ documentId, contractId }}
  insights={insights}
/>
```

### Future Enhancements

See `apps/web/src/docs/ai-assistant-framework.md` for detailed implementation roadmap:

- [ ] RAG implementation for intelligent document search
- [ ] AI agent integration for insights generation
- [ ] Multi-document comparison
- [ ] Proactive notifications
- [ ] Voice input support
- [ ] Export insights as reports
