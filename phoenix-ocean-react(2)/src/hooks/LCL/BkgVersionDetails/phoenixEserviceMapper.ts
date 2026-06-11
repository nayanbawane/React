const HIGHLIGHT_CLASS = 'eservice-changed';

export type FieldSelectorFn = (key: string) => string;

const defaultFieldSelector: FieldSelectorFn = (key) => `[data-eservice-field="${key}"]`;


export function applyEserviceChangedHighlights(
  changeFieldMap: Record<string, { status?: string | null } | unknown>,
  fieldSelector: FieldSelectorFn = defaultFieldSelector,
): void {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS);
  });

  const COMPOUND_SUFFIX_RE = /~(?:CARGO|PICKUP)(?:_IDENTIFIER)?~[UND]~.+$|~HAZ_FIELD~[UND]~.+$/;

  Object.entries(changeFieldMap).forEach(([key, entry]) => {
    const status = (entry as { status?: string | null })?.status;
    if (!status || status.toUpperCase() !== 'A') return;
    const selectorKey = key
      .replace(COMPOUND_SUFFIX_RE, '')
      .replace(/~$/, '');
    document.querySelectorAll(fieldSelector(selectorKey)).forEach((el) => {
      el.classList.add(HIGHLIGHT_CLASS);
    });
  });
}

export function clearEserviceChangedHighlights(): void {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS);
  });
}
