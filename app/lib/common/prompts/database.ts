import { convexGuidelines } from './convex';

export function databaseInstructions(options: {
  supabase?: {
    isConnected: boolean;
    hasSelectedProject: boolean;
    credentials?: {
      anonKey?: string;
      supabaseUrl?: string;
    };
  };
  convex?: {
    isConnected: boolean;
    projectToken: string | null;
  };
}): string {
  const { supabase, convex } = options;
  console.log(options);

  let dbPrompt = `<database_instructions>`;

  if (convex?.isConnected) {
    console.log('using Convex DB instructions!');
    dbPrompt += `
There is a Convex project already provisioned that may be useful for this task.

If there's any reason to persist data or run functions on it, Convex is the way to go! Install it with \`npm i convex@1.21.1-alpha.0 --force\` and after any change made, run it with \`npx convex dev --once\` to deploy the code.

If one does not exist, create a .env.local file containing at least this line:
CONVEX_DEPLOY_KEY="${convex.projectToken}"

The Convex client bindings are included in the 'convex' package, importable from 'convex/react' or 'convex/browser' (for non-React webapps).

Running \`npx convex dev --once\` creates a convex directory, and then you can build a normal convex app (a schema, queries, actions, mutations, etc.)

After you create these files, you'll want to run \`npx convex dev --once\` again to deploy that code.
Whenver you stop one long-running comand in the terminal (typically \`npm run dev\`) in order to run another command,
be sure to rerun that command once the other command is finished. This is important so the developer can keep seeing
their app!

If you're using Convex in a React app, use the hooks imported from "convex/react" to call these convex functions like this:

\`\`\`
import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const messages = useQuery(api.messages.list) || [];

  const [newMessageText, setNewMessageText] = useState("");
  const sendMessage = useMutation(api.messages.send);

  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  async function handleSendMessage(event) {
    event.preventDefault();
    await sendMessage({ body: newMessageText, author: name });
    setNewMessageText("");
  }
  return (
    <main>
      <h1>Convex Chat</h1>
      <p className="badge">
        <span>{name}</span>
      </p>
      <ul>
        {messages.map((message) => (
          <li key={message._id}>
            <span>{message.author}:</span>
            <span>{message.body}</span>
            <span>{new Date(message._creationTime).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSendMessage}>
        <input
          value={newMessageText}
          onChange={(event) => setNewMessageText(event.target.value)}
          placeholder="Write a message…"
        />
        <input type="submit" value="Send" disabled={!newMessageText} />
      </form>
    </main>
  );
}
\`\`\`

${convexGuidelines}
`;
  } else if (supabase?.isConnected) {
    console.log('using Supabase DB instructions');
    dbPrompt += `The following instructions guide how you should handle database operations in projects.

  CRITICAL: Use Supabase for databases by default, unless specified otherwise.

  IMPORTANT NOTE: Supabase project setup and configuration is handled seperately by the user! ${
    supabase
      ? !supabase.isConnected
        ? 'You are not connected to Supabase. Remind the user to "connect to Supabase in the chat box before proceeding with database operations".'
        : !supabase.hasSelectedProject
          ? 'Remind the user "You are connected to Supabase but no project is selected. Remind the user to select a project in the chat box before proceeding with database operations".'
          : ''
      : ''
  }
  IMPORTANT: Create a .env file if it doesnt exist and include the following variables:
  ${
    supabase?.isConnected &&
    supabase?.hasSelectedProject &&
    supabase?.credentials?.supabaseUrl &&
    supabase?.credentials?.anonKey
      ? `VITE_SUPABASE_URL=${supabase.credentials.supabaseUrl}
      VITE_SUPABASE_ANON_KEY=${supabase.credentials.anonKey}`
      : 'SUPABASE_URL=your_supabase_url\nSUPABASE_ANON_KEY=your_supabase_anon_key'
  }
  NEVER modify any Supabase configuration or \`.env\` files.

  CRITICAL DATA PRESERVATION AND SAFETY REQUIREMENTS:
    - DATA INTEGRITY IS THE HIGHEST PRIORITY, users must NEVER lose their data
    - FORBIDDEN: Any destructive operations like \`DROP\` or \`DELETE\` that could result in data loss (e.g., when dropping columns, changing column types, renaming tables, etc.)
    - FORBIDDEN: Any transaction control statements (e.g., explicit transaction management) such as:
      - \`BEGIN\`
      - \`COMMIT\`
      - \`ROLLBACK\`
      - \`END\`

      Note: This does NOT apply to \`DO $$ BEGIN ... END $$\` blocks, which are PL/pgSQL anonymous blocks!

      Writing SQL Migrations:
      CRITICAL: For EVERY database change, you MUST provide TWO actions:
        1. Migration File Creation:
          <boltAction type="supabase" operation="migration" filePath="/supabase/migrations/your_migration.sql">
            /* SQL migration content */
          </boltAction>

        2. Immediate Query Execution:
          <boltAction type="supabase" operation="query" projectId="\${projectId}">
            /* Same SQL content as migration */
          </boltAction>

        Example:
        <boltArtifact id="create-users-table" title="Create Users Table">
          <boltAction type="supabase" operation="migration" filePath="/supabase/migrations/create_users.sql">
            CREATE TABLE users (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              email text UNIQUE NOT NULL
            );
          </boltAction>

          <boltAction type="supabase" operation="query" projectId="\${projectId}">
            CREATE TABLE users (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              email text UNIQUE NOT NULL
            );
          </boltAction>
        </boltArtifact>

    - IMPORTANT: The SQL content must be identical in both actions to ensure consistency between the migration file and the executed query.
    - CRITICAL: NEVER use diffs for migration files, ALWAYS provide COMPLETE file content
    - For each database change, create a new SQL migration file in \`/home/project/supabase/migrations\`
    - NEVER update existing migration files, ALWAYS create a new migration file for any changes
    - Name migration files descriptively and DO NOT include a number prefix (e.g., \`create_users.sql\`, \`add_posts_table.sql\`).

    - DO NOT worry about ordering as the files will be renamed correctly!

    - ALWAYS enable row level security (RLS) for new tables:

      <example>
        alter table users enable row level security;
      </example>

    - Add appropriate RLS policies for CRUD operations for each table

    - Use default values for columns:
      - Set default values for columns where appropriate to ensure data consistency and reduce null handling
      - Common default values include:
        - Booleans: \`DEFAULT false\` or \`DEFAULT true\`
        - Numbers: \`DEFAULT 0\`
        - Strings: \`DEFAULT ''\` or meaningful defaults like \`'user'\`
        - Dates/Timestamps: \`DEFAULT now()\` or \`DEFAULT CURRENT_TIMESTAMP\`
      - Be cautious not to set default values that might mask problems; sometimes it's better to allow an error than to proceed with incorrect data

    - CRITICAL: Each migration file MUST follow these rules:
      - ALWAYS Start with a markdown summary block (in a multi-line comment) that:
        - Include a short, descriptive title (using a headline) that summarizes the changes (e.g., "Schema update for blog features")
        - Explains in plain English what changes the migration makes
        - Lists all new tables and their columns with descriptions
        - Lists all modified tables and what changes were made
        - Describes any security changes (RLS, policies)
        - Includes any important notes
        - Uses clear headings and numbered sections for readability, like:
          1. New Tables
          2. Security
          3. Changes

        IMPORTANT: The summary should be detailed enough that both technical and non-technical stakeholders can understand what the migration does without reading the SQL.

      - Include all necessary operations (e.g., table creation and updates, RLS, policies)

      Here is an example of a migration file:

      <example>
        /*
          # Create users table

          1. New Tables
            - \`users\`
              - \`id\` (uuid, primary key)
              - \`email\` (text, unique)
              - \`created_at\` (timestamp)
          2. Security
            - Enable RLS on \`users\` table
            - Add policy for authenticated users to read their own data
        */

        CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email text UNIQUE NOT NULL,
          created_at timestamptz DEFAULT now()
        );

        ALTER TABLE users ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can read own data"
          ON users
          FOR SELECT
          TO authenticated
          USING (auth.uid() = id);
      </example>

    - Ensure SQL statements are safe and robust:
      - Use \`IF EXISTS\` or \`IF NOT EXISTS\` to prevent errors when creating or altering database objects. Here are examples:

      <example>
        CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email text UNIQUE NOT NULL,
          created_at timestamptz DEFAULT now()
        );
      </example>

      <example>
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'last_login'
          ) THEN
            ALTER TABLE users ADD COLUMN last_login timestamptz;
          END IF;
        END $$;
      </example>

  Client Setup:
    - Use \`@supabase/supabase-js\`
    - Create a singleton client instance
    - Use the environment variables from the project's \`.env\` file
    - Use TypeScript generated types from the schema

  Authentication:
    - ALWAYS use email and password sign up
    - FORBIDDEN: NEVER use magic links, social providers, or SSO for authentication unless explicitly stated!
    - FORBIDDEN: NEVER create your own authentication system or authentication table, ALWAYS use Supabase's built-in authentication!
    - Email confirmation is ALWAYS disabled unless explicitly stated!

  Row Level Security:
    - ALWAYS enable RLS for every new table
    - Create policies based on user authentication
    - Test RLS policies by:
        1. Verifying authenticated users can only access their allowed data
        2. Confirming unauthenticated users cannot access protected data
        3. Testing edge cases in policy conditions

  Best Practices:
    - One migration per logical change
    - Use descriptive policy names
    - Add indexes for frequently queried columns
    - Keep RLS policies simple and focused
    - Use foreign key constraints

  TypeScript Integration:
    - Generate types from database schema
    - Use strong typing for all database operations
    - Maintain type safety throughout the application

  IMPORTANT: NEVER skip RLS setup for any table. Security is non-negotiable!`;
  } else {
    console.log('using generic DB instructions');
    dbPrompt += `There is no database the user has specified yet, but in this environment you are limited to Supabase or Convex.
    
  If you need to persist data, run scheduled functions, query data, or subscribe to updates, ask the user to connect to one of these.
  Prefer Convex unless the user asks for Supabase.

  Instruct the user to connect to either of these by clicking the corresponding buttons they can see below the chat box.`;
  }

  dbPrompt += `
</database_instructions>`;

  return dbPrompt;
}
