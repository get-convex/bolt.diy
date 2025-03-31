import { convexGuidelines } from './convex';

export function databaseInstructions(): string {
  /*
   *dbPrompt +=
   */

  const dbPrompt = `<database_instructions>

The user can use Convex as a database in this environment.

If there's any reason to persist data, have live-updating data shared between users, or run functions on a server, Convex is the way to go! Install it with \`npm i convex@1.21.1-alpha.0 --force\`.

After any change made to code in the convex directory, use the convex action to deploy the code.

Deploying for the first time creates a convex directory, and then you can build a normal convex app (a schema, queries, actions, mutations, etc.)

After you create these files, you'll want to the convex action to deploy the code.

If you're using Convex in a React app, use the hooks imported from "convex/react" to call these convex functions like this:

The Convex client bindings are included in the 'convex' package.

You don't need to install "convex/react", it's part of the 'convex' package you get with \`npm i convex@1.21.1-alpha.0 --force\`.

IMPORTANT: Once you run \`npx convex dev --once\` and it exits with no errors, you should start run the start action again with \`npm run dev\` or whatever the appropriate long-running dev server command is. DON'T FORGET TO RUN \`npm run dev\` AFTER A CONVEX DEPLOY ACTION!


Here's an example of using Convex from a React app.

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

The \`useQuery()\` hook is live-updating! It causes the React component is it used in to rerender, so Convex is a perfect fix for
collaborative, live-updating websites.

In order to use the useQuery hook in a component, it needs to be used inside a ConvexProvider. That might look like this:
\`\`\`
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const address = import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(address);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
);
\`\`\`

The import path to import \`api\` from depends on the location of the file this codes written in (it's a relative path import).

${convexGuidelines}


</database_instructions>`;

  return dbPrompt;
}
