type ApiDateValue = string | number | null | undefined;

const parseApiDate = (value: ApiDateValue) => {
  if (value == null) {
    return null;
  }

  if (typeof value === "number") {
    const ms = Math.abs(value) < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) {
    const ms = Math.abs(numeric) < 1e12 ? numeric * 1000 : numeric;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatApiDateTime = (value: ApiDateValue) => {
  const date = parseApiDate(value);

  if (!date) {
    return { date: "--", time: "--" };
  }

  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
};
