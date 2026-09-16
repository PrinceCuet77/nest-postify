export function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return { error: error.message, stack: error.stack };
  }

  return { error: String(error) };
}
