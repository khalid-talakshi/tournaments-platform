export const chunk = (data: any[], size: number) => {
  const chunked = [];
  for (let i = 0; i < data.length; i += size) {
    chunked.push(data.slice(i, i + size));
  }
  return chunked;
};
