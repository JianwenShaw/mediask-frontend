type ApiDateTimeValue = string | null | undefined;
type ApiDateValue = string | null | undefined;

const parseApiDateTime = (value: ApiDateTimeValue) => {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatApiDateTime = (value: ApiDateTimeValue) => {
  const date = parseApiDateTime(value);

  if (!date) {
    return { date: "--", time: "--" };
  }

  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
};

export const formatApiDate = (value: ApiDateValue) => {
  if (value == null) {
    return "--";
  }

  const trimmed = value.trim();
  return trimmed || "--";
};
