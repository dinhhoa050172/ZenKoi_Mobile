export const formatCapacity = (capacity: number) => {
  if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(1)}K Lít`;
  }
  return `${capacity} Lít`;
};
