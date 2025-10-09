'use client';

import {
  HeaderProps,
  Markdown,
  useChatContext,
  UserMessageProps,
  type AssistantMessageProps,
} from '@copilotkit/react-ui';

import '@copilotkit/react-ui/styles.css';
import { PanelRightClose } from 'lucide-react';

export function HeaderStyle({}: HeaderProps) {
  const { setOpen, open, icons, labels } = useChatContext();

  return (
    <div
      onClick={() => setOpen(!open)}
      aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      className="relative p-2 flex items-center justify-center cursor-pointer
  bg-gradient-to-r from-blue-400 via-violet-400 to-blue-500 text-white"
    >
      {/* Left icon */}
      <PanelRightClose className="absolute left-3 hover:scale-110 transition-all duration-300 ease-in-out" />

      {/* Centered title */}
      <h3 className="text-center">{labels.title}</h3>
    </div>
  );
}

export const AssistantMessageStyle = (props: AssistantMessageProps) => {
  const { icons } = useChatContext();
  const { message, isLoading, subComponent } = props;
  const messageStyles = 'px-2';
  return (
    <div className="">
      <div className="flex items-center">
        <div className={messageStyles}>
          {message && <Markdown content={message.content || ''} />}
          {isLoading && icons.spinnerIcon}
        </div>
      </div>
      <div className="my-2">{subComponent}</div>
    </div>
  );
};

export const UserMessageStyle = (props: UserMessageProps) => {
  const wrapperStyles = 'flex items-center gap-2 justify-end mb-2';
  const messageStyles =
    'bg-secondary/20 text-foreground py-1.5 px-4 rounded-xl break-words flex-shrink-0 max-w-[80%]';

  return (
    <div className={wrapperStyles}>
      <div className={messageStyles}>{props.message?.content}</div>
    </div>
  );
};
