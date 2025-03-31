import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';
import type { Message as AIMessage } from 'ai';
import { ConvexError, v } from 'convex/values';
import type { VAny, Infer } from 'convex/values';

export type SerializedMessage = Omit<AIMessage, 'createdAt'> & {
  createdAt: number | undefined;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IChatMetadataValidator = v.object({
  gitUrl: v.string(),
  gitBranch: v.optional(v.string()),
  netlifySiteId: v.optional(v.string()),
});

type IChatMetadata = Infer<typeof IChatMetadataValidator>;

export const set = mutation({
  args: {
    id: v.string(),
    messages: v.array(v.any() as VAny<SerializedMessage>),
    urlId: v.optional(v.string()),
    description: v.optional(v.string()),
    timestamp: v.optional(v.string()),
    metadata: v.optional(IChatMetadataValidator),
  },
  handler: async (ctx, args) => {
    return await _setMessages(ctx, args);
  },
});

export const setDescription = mutation({
  args: {
    id: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, description } = args;
    const existing = await getChatByIdOrUrlId(ctx, id);

    if (!existing) {
      throw new ConvexError({ code: 'NotFound', message: 'Chat not found' });
    }

    await ctx.db.patch(existing._id, {
      description,
    });
  },
});

export const allocateUrlId = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const { urlId, existing } = await _allocateUrlId(ctx, args.id);

    if (existing === null) {
      await ctx.db.insert('chats', {
        externalId: crypto.randomUUID(),
        messages: [],
        urlId,
        description: undefined,
        timestamp: new Date().toISOString(),
        metadata: undefined,
      });
    } else {
      await ctx.db.patch(existing._id, {
        urlId,
      });
    }

    return urlId;
  },
});

export const duplicate = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const existing = await getChatById(ctx, id);

    if (!existing) {
      throw new ConvexError({ code: 'NotFound', message: 'Chat not found' });
    }

    return createChatFromMessages(
      ctx,
      `${existing.description || 'Chat'} (copy)`,
      existing.messages,
      existing.metadata,
    );
  },
});

export const fork = mutation({
  args: {
    id: v.string(),
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, messageId } = args;
    const chat = await getChatByIdOrUrlId(ctx, id);

    if (!chat) {
      throw new ConvexError({ code: 'NotFound', message: 'Chat not found' });
    }

    // Find the index of the message to fork at
    const messageIndex = chat.messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex === -1) {
      throw new ConvexError({ code: 'NotFound', message: 'Message not found' });
    }

    // Get messages up to and including the selected message
    const messages = chat.messages.slice(0, messageIndex + 1);

    return createChatFromMessages(ctx, `${chat.description} (fork)`, messages, chat.metadata);
  },
});

export const createFromMessages = mutation({
  args: {
    description: v.string(),
    messages: v.array(v.any() as VAny<SerializedMessage>),
    metadata: v.optional(IChatMetadataValidator),
  },
  handler: async (ctx, args) => {
    const { description, messages, metadata } = args;
    return createChatFromMessages(ctx, description, messages, metadata);
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    return getChatByIdOrUrlId(ctx, id);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const results = await ctx.db.query('chats').collect();
    return results.map((result) => ({
      externalId: result.externalId,
      urlId: result.urlId,
      description: result.description,
      timestamp: result.timestamp,
      metadata: result.metadata,

      // omit messages for now
      // messages: result.messages,
    }));
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const existing = await getChatByIdOrUrlId(ctx, id);

    if (!existing) {
      return;
    }

    await ctx.db.delete(existing._id);
  },
});

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const chats = await ctx.db.query('chats').collect();

    for (const chat of chats) {
      await ctx.db.delete(chat._id);
    }
  },
});

async function _setMessages(
  ctx: MutationCtx,
  args: {
    id: string;
    messages: SerializedMessage[];
    urlId?: string;
    description?: string;
    timestamp?: string;
    metadata?: IChatMetadata;
  },
) {
  const { id, messages, urlId, description, timestamp, metadata } = args;
  const existing = await getChatById(ctx, id);

  if (existing) {
    await ctx.db.replace(existing._id, {
      externalId: existing.externalId,
      messages,
      urlId,
      description,
      timestamp: timestamp ?? new Date().toISOString(),
      metadata,
    });
    return;
  }

  await ctx.db.insert('chats', {
    externalId: id,
    messages,
    urlId,
    description,
    timestamp: timestamp ?? new Date().toISOString(),
    metadata,
  });
}

async function _allocateUrlId(ctx: QueryCtx, id: string) {
  const existing = await getChatById(ctx, id);

  if (existing === null || !existing.urlId) {
    let i = 2;

    while (true) {
      const newUrlId = `${id}-${i}`;

      const m = await getChatByUrlId(ctx, newUrlId);

      if (m === null) {
        return { urlId: newUrlId, existing };
      }

      i++;
    }
  }

  return { urlId: existing.urlId, existing };
}

export async function createChatFromMessages(
  ctx: MutationCtx,
  description: string,
  messages: SerializedMessage[],
  metadata?: IChatMetadata,
): Promise<string> {
  const newId = await crypto.randomUUID();
  const { urlId } = await _allocateUrlId(ctx, newId); // Get a new urlId for the duplicated chat

  await _setMessages(ctx, {
    id: newId,
    messages,
    urlId,
    description,
    timestamp: undefined, // Use the current timestamp
    metadata,
  });

  return urlId; // Return the urlId instead of id for navigation
}

function getChatById(ctx: QueryCtx, id: string) {
  return ctx.db
    .query('chats')
    .withIndex('byExternalId', (q) => q.eq('externalId', id))
    .unique();
}

function getChatByUrlId(ctx: QueryCtx, id: string) {
  return ctx.db
    .query('chats')
    .withIndex('byUrlId', (q) => q.eq('urlId', id))
    .unique();
}

async function getChatByIdOrUrlId(ctx: QueryCtx, id: string) {
  const byId = await getChatById(ctx, id);

  if (byId !== null) {
    return byId;
  }

  const byUrlId = await getChatByUrlId(ctx, id);

  return byUrlId;
}
