import {
  HeaderProps,
  Markdown,
  useChatContext,
  UserMessageProps,
  type AssistantMessageProps,
} from '@copilotkit/react-ui';

import '@copilotkit/react-ui/styles.css';
import { BookOpenIcon } from 'lucide-react';

export function HeaderStyle({}: HeaderProps) {
  const { setOpen, icons, labels } = useChatContext();

  return (
    <div className="rounded-t-lg flex justify-between items-center p-3 bg-secondary/90 text-white">
      <div className="w-24">
        <BookOpenIcon className="w-6 h-6" />
      </div>
      <div className="text-lg">{labels.title}</div>
      <div className="w-24 flex justify-end">
        <button onClick={() => setOpen(false)} aria-label="Close">
          {icons.headerCloseIcon}
        </button>
      </div>
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
