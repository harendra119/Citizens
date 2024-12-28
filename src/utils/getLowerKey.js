export const getLowerKey = (key1, key2) => {
  return key1 > key2 ? `${key2}_${key1}` : `${key1}_${key2}`;
};
