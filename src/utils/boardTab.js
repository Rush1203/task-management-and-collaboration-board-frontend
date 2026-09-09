// Deterministically assigns each board one of five accent tabs based on its
// id, so a board keeps a stable "color identity" across sessions instead of
// every card looking identical or colors reshuffling on each render.
const TAB_COLORS = ['tab1', 'tab2', 'tab3', 'tab4', 'tab5'];

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const boardTabColor = (boardId = '') => TAB_COLORS[hashString(boardId) % TAB_COLORS.length];

// Tailwind's JIT compiler only picks up class names it can find as literal
// strings in source — a template-built class like `bg-${tab}` would be
// purged in production. This lookup keeps every class name literal so the
// build always includes it.
export const TAB_BG_CLASS = {
  tab1: 'bg-tab1',
  tab2: 'bg-tab2',
  tab3: 'bg-tab3',
  tab4: 'bg-tab4',
  tab5: 'bg-tab5',
};
