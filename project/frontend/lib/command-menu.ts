let returnFocus: HTMLElement | null = null;

/** The triggering element survives a lazy-loaded command palette. */
export function getCommandMenuReturnFocus() {
  return returnFocus;
}

/** Opens the ⌘K command menu from anywhere (header, footer, 404). */
export const COMMAND_MENU_EVENT = 'devabdullah:command-menu';

export function openCommandMenu() {
  returnFocus =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  window.dispatchEvent(new Event(COMMAND_MENU_EVENT));
}
