import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal as XTerm } from '@xterm/xterm';
import { memo, useEffect, useRef } from 'react';
import { getTerminalTheme } from '~/components/workbench/terminal/theme';

export const ConvexDeployTerminal = memo(({ input }: { input: string }) => {
  const terminalElementRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm>();
  const lastInputLength = useRef<number>(0);

  useEffect(() => {
    const element = terminalElementRef.current!;
    const webLinksAddon = new WebLinksAddon();

    const terminal = new XTerm({
      cursorBlink: true,
      convertEol: true,
      disableStdin: true,
      theme: getTerminalTheme({ cursor: '#00000000' }),
      fontSize: 12,
      fontFamily: 'Menlo, courier-new, courier, monospace',
      rows: 10,
    });

    terminalRef.current = terminal;
    terminal.loadAddon(webLinksAddon);
    terminal.open(element);
    terminal.write(input);
    lastInputLength.current = input.length;

    return () => {
      terminal.dispose();
    };
  }, []);

  useEffect(() => {
    const terminal = terminalRef.current;

    if (!terminal) {
      return;
    }

    // Only write the new content that was appended
    const newContent = input.slice(lastInputLength.current);

    if (newContent) {
      terminal.write(newContent);
      lastInputLength.current = input.length;
    }
  }, [input]);

  return (
    <div className="border-bolt-elements-borderColor border rounded-lg overflow-auto my-2 bg-bolt-elements-terminals-background">
      <div ref={terminalElementRef} />
    </div>
  );
});
