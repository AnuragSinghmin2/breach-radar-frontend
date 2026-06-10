const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(String(email || "").trim());
}

export function validateLoginForm({ email, password }) {
  const errors = [];

  if (!String(email || "").trim()) {
    errors.push("Email is required.");
  } else if (!isValidEmail(email)) {
    errors.push("Enter a valid email address.");
  }

  if (!password) {
    errors.push("Password is required.");
  }

  return errors;
}

export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = [];

  if (!String(name || "").trim()) {
    errors.push("Name is required.");
  }

  if (!String(email || "").trim()) {
    errors.push("Email is required.");
  } else if (!isValidEmail(email)) {
    errors.push("Enter a valid email address.");
  }

  if (!password) {
    errors.push("Password is required.");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }

  if (password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  return errors;
}
