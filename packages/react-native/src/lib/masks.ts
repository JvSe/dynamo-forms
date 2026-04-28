export const formatDocument = (input?: string): string => {
  const digits = (input ?? "").replace(/\D/g, "");

  if (digits.length <= 11) {
    let out = "";
    for (let i = 0; i < digits.length && i < 11; i++) {
      if (i === 3 || i === 6) out += ".";
      else if (i === 9) out += "-";
      out += digits[i];
    }
    return out;
  }

  // CNPJ — 00.000.000/0000-00
  let out = "";
  for (let i = 0; i < digits.length && i < 14; i++) {
    if (i === 2 || i === 5) out += ".";
    else if (i === 8) out += "/";
    else if (i === 12) out += "-";
    out += digits[i];
  }
  return out;
};

export const formatPhone = (input?: string): string => {
  if (!input) return "";
  const digits = input.replace(/[^\d]+/g, "").replace(/^55/, "");

  if (digits.length >= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  return digits;
};

export const formatZipCode = (input?: string): string => {
  const digits = (input ?? "").replace(/\D/g, "");
  if (digits.length > 5) {
    return (digits.slice(0, 5) + "-" + digits.slice(5)).slice(0, 9);
  }
  return digits;
};
