// Efficiently handle stdin/piping

export async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf-8');
}

export function isStdinPiped(): boolean {
  return !process.stdin.isTTY;
}

export function isTTY(): boolean {
  return process.stdout.isTTY === true;
}

export async function getInput(prompt?: string): Promise<string> {
  const parts: string[] = [];

  // Check if stdin is piped
  if (isStdinPiped()) {
    const stdinContent = await readStdin();
    if (stdinContent.trim()) {
      parts.push(stdinContent.trim());
    }
  }

  // Add the prompt if provided
  if (prompt) {
    parts.push(prompt);
  }

  return parts.join('\n\n');
}
