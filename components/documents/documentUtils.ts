export const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").substring(0, 120);

export const wordCount = (html: string) => {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
};

export const formatRelativeDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (d >= today) return "Today";
  if (d >= weekAgo) return d.toLocaleDateString('en-GB', { weekday: 'long' });
  if (d >= monthAgo) return Math.ceil((today.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000)) + " days ago";
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const groupByDate = (docs: any[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    today: docs.filter(d => new Date(d.updatedAt) >= today),
    thisWeek: docs.filter(d => new Date(d.updatedAt) >= weekAgo && new Date(d.updatedAt) < today),
    thisMonth: docs.filter(d => new Date(d.updatedAt) >= monthAgo && new Date(d.updatedAt) < weekAgo),
    older: docs.filter(d => new Date(d.updatedAt) < monthAgo),
  };
};