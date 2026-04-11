import { useEffect, useMemo } from 'react';

const PREVENT_EVENT = (event) => {
  event.preventDefault();
  event.stopPropagation();
};

export default function useContentProtection({ enabled = true, onBlocked } = {}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event) => {
      const key = String(event.key || '').toLowerCase();
      const ctrlOrMeta = event.ctrlKey || event.metaKey;
      const blockedCombo = ctrlOrMeta && ['c', 'x', 'v', 'a', 's', 'p'].includes(key);
      const isPrintScreen = key === 'printscreen';

      if (!blockedCombo && !isPrintScreen) return;

      PREVENT_EVENT(event);
      if (typeof onBlocked === 'function') onBlocked();

      if (isPrintScreen && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText('').catch(() => {});
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, onBlocked]);

  const protectionProps = useMemo(() => ({
    onCopy: PREVENT_EVENT,
    onCut: PREVENT_EVENT,
    onPaste: PREVENT_EVENT,
    onContextMenu: PREVENT_EVENT,
    onDragStart: PREVENT_EVENT,
    onSelectStart: PREVENT_EVENT,
  }), []);

  const protectionSx = useMemo(() => ({
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitTouchCallout: 'none',
  }), []);

  return { protectionProps, protectionSx };
}
