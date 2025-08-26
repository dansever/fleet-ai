// src/lib/browser/copy-to-clipboard.ts
export async function copyToClipboard(
  text: string,
  onSuccess?: () => void,
  onError?: () => void,
): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      // SSR safety
      onError?.();
      return false;
    }

    // Prefer modern API when available
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      onSuccess?.();
      return true;
    }

    // Fallback: temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Avoid scrolling/jumping on iOS
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (ok) {
      onSuccess?.();
      return true;
    }
    onError?.();
    return false;
  } catch (err) {
    // Common failure reasons:
    // - Non-secure context (http instead of https)
    // - Clipboard permissions denied
    // - Browser policy restrictions
    console.error('error copying to clipboard', err);
    onError?.();
    return false;
  }
}
