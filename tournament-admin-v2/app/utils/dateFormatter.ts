export const localeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

export const UTCFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
});
