// Utility: clean float values
export const cleanFloatValues = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(cleanFloatValues);
  } else if (typeof obj === "object" && obj !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanFloatValues(value);
    }
    return cleaned;
  } else if (typeof obj === "number") {
    if (isNaN(obj) || !isFinite(obj)) return null;
    return obj;
  }
  return obj;
};
