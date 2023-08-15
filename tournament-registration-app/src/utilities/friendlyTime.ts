export const friendlyTime = (dateStr: string) => {
  if (dateStr === "") {
    return "";
  }
  const date = Date.parse(dateStr);
  return new Date(date).toISOString().split("T")[1].split(".")[0];
};
