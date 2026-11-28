// Kit checklist categories in the order users see them. Admins can add new ones.
export const KNOWN_CATEGORIES = ['water', 'food', 'medical', 'documents', 'tools', 'other'];

export function sortCategories(categories) {
  const rank = (c) => {
    const i = KNOWN_CATEGORIES.indexOf(c);
    return i === -1 ? KNOWN_CATEGORIES.length : i;
  };
  return [...categories].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export function groupByCategory(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.category)) groups.set(item.category, []);
    groups.get(item.category).push(item);
  }
  return sortCategories([...groups.keys()]).map((category) => ({
    category,
    items: groups.get(category).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
  }));
}

export const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);
