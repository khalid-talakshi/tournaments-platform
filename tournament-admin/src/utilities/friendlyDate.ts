export const friendlyDate = (dateStr: string) => {
  if (dateStr === "") {
    return "";
  }
  const date = Date.parse(dateStr);
  return new Date(date).toISOString().split("T")[0];
};
