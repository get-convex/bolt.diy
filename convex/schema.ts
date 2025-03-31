import { defineSchema, defineTable } from 'convex/server';
import { v, type VAny } from 'convex/values';
import type { Message as AIMessage } from 'ai';
import { IChatMetadataValidator } from './messages';
import type { SerializedMessage } from './messages';

export default defineSchema({
  projects: defineTable({
    text: v.string(),
    subject: v.string(),
    convexToken: v.optional(v.string()),
  })
    .index('by_subject', ['subject'])
    .index('by_subject_and_convex_token', ['subject', 'convexToken']),
  chats: defineTable({
    messages: v.array(v.any() as VAny<SerializedMessage>),
    externalId: v.string(),
    urlId: v.optional(v.string()),
    description: v.optional(v.string()),
    timestamp: v.string(),
    metadata: v.optional(IChatMetadataValidator),
  })
    .index('byExternalId', ['externalId'])
    .index('byUrlId', ['urlId']),
});
