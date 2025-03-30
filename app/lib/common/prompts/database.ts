//import { convexGuidelines } from './convex';

export function databaseInstructions(options: {
  convex?: {
    isConnected: boolean;
    projectToken: string | null;
  };
}): string {
  const { convex } = options;
  let dbPrompt = `<database_instructions>
`;

  if (convex?.isConnected) {
    dbPrompt += `If there's any reason to persist data or run functions on a server, Convex is the way to go!

There is a Convex project already provisioned and connected to this project.

If it hasn't been installed, install it with \`npm i convex@1.21.1-alpha.0 --force\`.
If a .env.local file does not exist, it a file there containing at least this line:
CONVEX_DEPLOY_KEY="${convex.projectToken}"

If a .env.local file does exist, you'll still need to add the line
CONVEX_DEPLOY_KEY="${convex.projectToken}"

and you'll also need to run \`npx convex dev --once\` to complete the setup: automatically adding an environment variable like VITE_CONVEX_URL.

After any change made to code in the convex directory or the first time after the CONVEX_DEPLOY_KEY has been added to the .env.local file,
run it with \`npx convex dev --once\` to deploy the code.\`.

`;
  } else {
    dbPrompt += `
    You can use Convex in this environment, but there is no convex project connected yet.

If you need to persist data, run scheduled functions, query data, or subscribe to updates, ask the user to connect to a Convex deployment.

If you need to install it, install with \`npm i convex@1.21.1-alpha.0 --force\` since 1.21.1-alpha.0 is a version known to work with this environment.

IMPORTANT: Don't write any Convex code until the user has connected a project!

Instead, suggest Convex and send something like this boltAction of type convex-connect.

<boltArtifact>
  <boltAction type="convex-connect">
  </boltAction>
</boltArtifact>

You'll receive more instructions once the user has connected their Convex project
so there's no need to take further action now.

`;
  }

  if (convex?.isConnected) {
    dbPrompt += ` The Convex client bindings are included in the 'convex' package, importable from 'convex/react' or 'convex/browser' (for non-React webapps).

Running \`npx convex dev --once\` creates a convex directory, and then you can build a normal convex app (a schema, queries, actions, mutations, etc.)

After you create these files, you'll want to run \`npx convex dev --once\` again to deploy that code.
Whenever you stop one long-running command in the terminal (typically \`npm run dev\`) in order to run another command,
be sure to rerun that command once the other command is finished. This is important so the developer can keep seeing
their app!

IMPORTANT: Once \`npx convex dev --once\` has run successfully, you should run \`npm run dev\` again!


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

The import path to import \`api\` from depends on the location of the file this codes written in (it's a relative path import).


`;
  }

  dbPrompt += `</database_instructions>`;

  return dbPrompt;
}

/*
${convexGuidelines}
*/
