import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';

type UIMsg = { role: 'user' | 'assistant' | 'system'; parts?: any[]; content?: string };

export function toLCMessages(messages: UIMsg[]) {
  return messages.map((m) => {
    const content =
      m.parts
        ?.filter((p: any) => p?.type === 'text')
        .map((p: any) => p.text)
        .join('') ??
      m.content ??
      '';

    switch (m.role) {
      case 'assistant':
        return new AIMessage(content);
      case 'system':
        return new SystemMessage(content);
      case 'user':
      default:
        return new HumanMessage(content);
    }
  });
}
