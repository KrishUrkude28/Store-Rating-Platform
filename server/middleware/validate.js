// Validation utilities according to PRD section 34

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const UPPERCASE_REGEX = /[A-Z]/;

function validateName(name) {
  if (typeof name !== 'string') {
    return 'Name must be a string.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return 'Name must contain between 20 and 60 characters.';
  }
  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return 'Please provide a valid email address.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return 'Password must be a string.';
  }
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!UPPERCASE_REGEX.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

function validateAddress(address) {
  if (typeof address !== 'string' || address.trim().length === 0) {
    return 'Address is required.';
  }
  if (address.trim().length > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
}

function validateRating(rating) {
  if (rating === undefined || rating === null || rating === '') {
    return 'Rating is required.';
  }
  const num = Number(rating);
  if (!Number.isInteger(num)) {
    return 'Rating must be an integer.';
  }
  if (num < 1 || num > 5) {
    return 'Rating must be between 1 and 5.';
  }
  return null;
}

function validateRole(role) {
  const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
  if (!validRoles.includes(role)) {
    return `Role must be one of: ${validRoles.join(', ')}.`;
  }
  return null;
}

// Middleware handlers
const validateRegistration = (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  const errors = {};
  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(password);
  if (passwordErr) errors.password = passwordErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  if (role !== undefined) {
    const roleErr = validateRole(role);
    if (roleErr) errors.role = roleErr;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateUserCreation = (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  const errors = {};
  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(password);
  if (passwordErr) errors.password = passwordErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  const roleErr = validateRole(role);
  if (roleErr) errors.role = roleErr;

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const errors = {};
  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }

  const passwordErr = validatePassword(newPassword);
  if (passwordErr) errors.newPassword = passwordErr;

  if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'New password and confirmation do not match.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateStoreCreation = (req, res, next) => {
  const { name, email, address, owner_id } = req.body;

  const errors = {};
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Store name is required.';
  }

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const addressErr = validateAddress(address);
  if (addressErr) errors.address = addressErr;

  if (!owner_id) {
    errors.owner_id = 'Store owner is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateRatingInput = (req, res, next) => {
  const { rating } = req.body;
  const ratingErr = validateRating(rating);
  if (ratingErr) {
    return res.status(400).json({ message: 'Validation failed', errors: { rating: ratingErr } });
  }
  req.body.rating = Number(rating);
  next();
};

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateRating,
  validateRole,
  validateRegistration,
  validateUserCreation,
  validatePasswordChange,
  validateStoreCreation,
  validateRatingInput
};
