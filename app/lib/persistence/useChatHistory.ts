import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { atom } from 'nanostores';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import { workbenchStore } from '~/lib/stores/workbench';
import { useConvex, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ConvexError } from 'convex/values';
import type { SerializedMessage } from '@convex/messages';

export interface IChatMetadata {
  gitUrl: string;
  gitBranch?: string;
  netlifySiteId?: string;
}

export interface ChatHistoryItemConvex {
  externalId: string;
  urlId?: string;
  description?: string;
  timestamp: string;
  metadata?: IChatMetadata;
}

export interface ChatHistoryItem {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
  metadata?: IChatMetadata;
}

export const chatId = atom<string | undefined>(undefined);
export const description = atom<string | undefined>(undefined);
export const chatMetadata = atom<IChatMetadata | undefined>(undefined);

export const useChatHistoryConvex = () => {
  const navigate = useNavigate();

  // mixedId means either chatId or urlId
  const { id: mixedId } = useLoaderData<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const [initialMessages, setInitialMessages] = useState<SerializedMessage[]>([]);
  const [initialDeserializedMessages, setInitialDeserializedMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState<boolean>(false);
  const [urlId, setUrlId] = useState<string | undefined>();
  const convex = useConvex();
  const rawMessages = useQuery(api.messages.get, mixedId === undefined ? 'skip' : { id: mixedId });
  useEffect(() => {
    if (rawMessages) {
      if (rawMessages.messages.length > 0) {
        const rewindId = searchParams.get('rewindTo');
        const filteredMessages = rewindId
          ? rawMessages.messages.slice(0, rawMessages.messages.findIndex((m) => m.id === rewindId) + 1)
          : rawMessages.messages;

        setInitialMessages(filteredMessages);
        setInitialDeserializedMessages(filteredMessages.map(deserializeMessageForConvex));
        setUrlId(rawMessages.urlId);
        description.set(rawMessages.description);
        chatId.set(rawMessages.externalId);
        chatMetadata.set(rawMessages.metadata);
        setReady(true);
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [rawMessages]);

  return {
    ready: mixedId === undefined || ready,
    initialMessages: initialDeserializedMessages,
    updateChatMestaData: async (metadata: IChatMetadata) => {
      const id = chatId.get();

      if (!id) {
        return;
      }

      try {
        await convex.mutation(api.messages.set, {
          id,
          messages: initialMessages,
          urlId,
          description: description.get(),
          metadata,
        });
        chatMetadata.set(metadata);
      } catch (error) {
        toast.error('Failed to update chat metadata');
        console.error(error);
      }
    },
    storeMessageHistory: async (messages: Message[]) => {
      if (!convex || messages.length === 0) {
        return;
      }

      const { firstArtifact } = workbenchStore;

      if (!urlId && firstArtifact?.id) {
        const urlId = await convex.mutation(api.messages.allocateUrlId, { id: firstArtifact.id });

        navigateChat(urlId);
        setUrlId(urlId);
      }

      if (!description.get() && firstArtifact?.title) {
        description.set(firstArtifact?.title);
      }

      if (initialMessages.length === 0 && !chatId.get()) {
        // sshader -- why do they want incrementing IDs?
        const nextId = await crypto.randomUUID();

        chatId.set(nextId);

        if (!urlId) {
          navigateChat(nextId);
        }
      }

      const id = chatId.get() as string;

      await convex.mutation(api.messages.set, {
        id,
        messages: messages.map(serializeMessageForConvex),
        urlId,
        description: description.get(),
        metadata: chatMetadata.get(),
      });
    },
    duplicateCurrentChat: async (listItemId: string) => {
      if (!mixedId && !listItemId) {
        return;
      }

      try {
        const newId = await convex.mutation(api.messages.duplicate, { id: mixedId || listItemId });
        navigate(`/chat/${newId}`);
        toast.success('Chat duplicated successfully');
      } catch (error) {
        toast.error('Failed to duplicate chat');
        console.log(error);
      }
    },
    importChat: async (description: string, messages: Message[], metadata?: IChatMetadata) => {
      try {
        const newId = await convex.mutation(api.messages.createFromMessages, {
          description,
          messages: messages.map(serializeMessageForConvex),
          metadata,
        });
        window.location.href = `/chat/${newId}`;
        toast.success('Chat imported successfully');
      } catch (error) {
        if (error instanceof ConvexError) {
          toast.error('Failed to import chat: ' + error.message);
        } else {
          toast.error('Failed to import chat');
        }
      }
    },
    exportChat: async (id = urlId) => {
      if (!id) {
        return;
      }

      const chat = await convex.query(api.messages.get, { id });

      if (!chat) {
        return;
      }

      const chatData = {
        messages: chat.messages,
        description: chat.description,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  };
};

function navigateChat(nextId: string) {
  /**
   * FIXME: Using the intended navigate function causes a rerender for <Chat /> that breaks the app.
   *
   * `navigate(`/chat/${nextId}`, { replace: true });`
   */
  const url = new URL(window.location.href);
  url.pathname = `/chat/${nextId}`;

  window.history.replaceState({}, '', url);
}

function serializeMessageForConvex(message: Message) {
  return {
    ...message,
    createdAt: message.createdAt?.getTime() ?? undefined,
  };
}

function deserializeMessageForConvex(message: SerializedMessage): Message {
  return {
    ...message,
    createdAt: message.createdAt ? new Date(message.createdAt) : undefined,
  };
}
