export const createPageUrl = (pageName) => {
  return `/${pageName}`;
};

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
