# AI Assistant UX Framework

## Overview

This document describes the new AI Assistant framework integrated into the contract document viewing experience. The framework provides a flexible, context-aware interface for users to interact with contract data through AI-powered insights and conversational queries.

## Components

### 1. AIAssistant Component (`_components/AIAssistant.tsx`)

A flexible AI assistant component with three display modes:

#### Display Modes

**Inline Mode** (default)

- Embedded directly within content tabs
- Shows AI insights and chat interface inline with document content
- Used in Summary, Extracted Data, and Content tabs

**Panel Mode**

- Standalone panel with fixed dimensions
- Suitable for sidebar or dedicated sections
- Max height of 500px with scrollable content

**Floating Mode**

- Fixed position at bottom-right corner
- Collapsible button that expands into full chat interface
- Shows badge with number of available insights
- Follows the user across the page

#### Features

1. **AI Insights Cards**
   - Visual cards displaying AI-generated insights
   - Color-coded by insight type:
     - `opportunity` - Green (cost savings, better deals)
     - `warning` - Red (risks, compliance issues)
     - `expiration` - Amber (upcoming deadlines)
     - `info` - Blue (general information)
   - Each insight can have an optional action button

2. **Chat Interface**
   - Message history display (user and assistant messages)
   - Input field with send button
   - Loading state with animated dots
   - Timestamps on messages

3. **Suggested Questions**
   - Pre-populated question buttons when chat is empty
   - Common queries users might have about contracts
   - Quick-start engagement with AI

4. **Context-Aware**
   - Accepts document ID, contract ID, and document name
   - Uses context to provide relevant responses
   - Can be customized per document/contract

## Integration Points

### Contract Files View

The AI Assistant is integrated at multiple touchpoints:

1. **Floating Assistant** (Bottom-right)
   - Always available when viewing a document
   - Shows 2 example insights (expiration, savings opportunity)
   - Full chat interface available on expansion

2. **Summary Tab**
   - Inline assistant below summary content
   - Focus on document highlights and key takeaways

3. **Extracted Data Tab**
   - AI insights section at the top
   - Shows contract-specific analysis:
     - Contract expiration warnings
     - Potential savings opportunities
   - Inline assistant at bottom for queries

4. **Content Tab**
   - Inline assistant for content-specific queries
   - Can ask about specific sections or terms in the document

## Extracted Data Improvements

### New Table Layout

Replaced the long vertical card list with a more compact table-style layout:

- **Header Row**: Term | Value | Actions
- **Expandable Rows**: Each row can be expanded to show the source quote
- **Actions Column**: Copy button + Quote expand button (if quote exists)

### Hidden Quotes by Default

- Source snippets are hidden by default
- Accordion component used for expansion
- Quote icon button triggers expansion
- Quotes shown with visual indicator (blue border, italic text, quote icon)

### Search Functionality

- Search bar filters both term keys and values
- Sticky positioning for easy access while scrolling
- Real-time filtering as user types

## AI Implementation Roadmap

### Phase 1: AI Insights Generation (To Be Implemented)

**Contract Analysis Agent**

- Analyze contract terms and dates
- Identify expiration dates and calculate days remaining
- Flag important deadlines and milestones

**Financial Optimization Agent**

- Compare pricing with market data
- Identify potential savings opportunities
- Suggest negotiation points

**Risk Assessment Agent**

- Identify problematic clauses
- Flag compliance issues
- Highlight unusual or risky terms

### Phase 2: RAG Implementation (To Be Implemented)

**Document Embedding**

- Create vector embeddings of contract content
- Store in vector database for semantic search
- Update embeddings when documents change

**Context-Aware Responses**

- Use RAG to answer specific questions about contracts
- Reference exact sections and page numbers
- Multi-document queries across all contracts

**Suggested Actions**

- AI-generated action items based on contract analysis
- Reminders for important dates
- Recommendations for contract improvements

### Phase 3: Advanced Features (Future)

**Multi-Turn Conversations**

- Maintain conversation history
- Follow-up questions with context
- Clarification and deep-dive queries

**Proactive Insights**

- Push notifications for important events
- Weekly digest of contract status
- Anomaly detection in new contracts

**Contract Comparison**

- Side-by-side comparison of similar contracts
- Identify best/worst terms across vendors
- Standardization recommendations

## API Integration Points

### Functions to Implement

```typescript
// Generate insights for a document
async function generateDocumentInsights(
  documentId: string,
  contractId: string,
): Promise<AIInsight[]>;

// Chat with AI about document
async function chatWithDocument(
  message: string,
  context: {
    documentId: string;
    contractId: string;
    conversationHistory: Message[];
  },
): Promise<string>;

// Get suggested questions based on document type
async function getSuggestedQuestions(
  documentType: string,
  documentMetadata: Record<string, any>,
): Promise<string[]>;
```

## UX Principles

1. **Always Available**: AI assistance should be accessible at all times, not hidden in a separate tab
2. **Contextual**: Insights and responses should be relevant to what the user is viewing
3. **Non-Intrusive**: Floating mode allows users to engage when needed, not forced
4. **Progressive Disclosure**: Show summaries first, expand for details
5. **Visual Hierarchy**: Use color coding and icons to communicate insight importance
6. **Action-Oriented**: Provide actionable insights, not just information

## Styling Guidelines

- Purple/Blue gradient: AI-related features
- Color-coded insights: Quick visual scanning
- Rounded corners: Modern, friendly interface
- Smooth transitions: Professional feel
- Consistent spacing: 4px base unit (gap-1 to gap-4)

## Future Considerations

1. **Mobile Responsiveness**: Adapt floating mode for mobile devices
2. **Keyboard Shortcuts**: Quick access to AI assistant (e.g., Cmd+K)
3. **Voice Input**: Enable voice queries for hands-free operation
4. **Export Insights**: Allow users to export AI insights as PDF/report
5. **Insight History**: Track and review past insights over time
6. **Custom Insights**: Allow users to configure which insights they want to see

## Testing Checklist

- [ ] Floating assistant opens/closes smoothly
- [ ] Inline assistants render in all tabs
- [ ] Insights display with correct colors and icons
- [ ] Chat messages send and display correctly
- [ ] Suggested questions are clickable (not yet functional)
- [ ] Context props are passed correctly
- [ ] Loading states display appropriately
- [ ] Mobile responsive behavior
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Performance (no lag with many insights)
