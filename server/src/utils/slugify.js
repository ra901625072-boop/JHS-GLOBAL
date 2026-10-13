import slugifyPackage from 'slugify';

export const createSlug = (text) => {
  if (!text) return '';
  return slugifyPackage(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

export default createSlug;
