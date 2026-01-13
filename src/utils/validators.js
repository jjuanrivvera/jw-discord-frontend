/**
 * Common validation rules for Vuetify forms
 * Usage: import { rules } from '@/utils/validators'
 * Then use: :rules="[rules.required, rules.maxLength(50)]"
 */

export const rules = {
  /**
   * Field is required
   */
  required: (v) => !!v || "This field is required",

  /**
   * Valid email format
   */
  email: (v) => !v || /.+@.+\..+/.test(v) || "Invalid email address",

  /**
   * Minimum length validator
   * @param {number} min - Minimum length required
   */
  minLength: (min) => (v) =>
    !v || v.length >= min || `Minimum ${min} characters required`,

  /**
   * Maximum length validator
   * @param {number} max - Maximum length allowed
   */
  maxLength: (max) => (v) =>
    !v || v.length <= max || `Maximum ${max} characters allowed`,

  /**
   * Numeric only
   */
  numeric: (v) => !v || /^\d+$/.test(v) || "Must be a number",

  /**
   * Alphanumeric only
   */
  alphanumeric: (v) =>
    !v || /^[a-zA-Z0-9]+$/.test(v) || "Only letters and numbers allowed",

  /**
   * Valid URL format
   */
  url: (v) => !v || /^https?:\/\/.+/.test(v) || "Invalid URL format",

  /**
   * Valid hour (0-23)
   */
  hour: (v) => {
    const num = parseInt(v);
    return (!isNaN(num) && num >= 0 && num <= 23) || "Must be between 0 and 23";
  },

  /**
   * Valid language code
   */
  language: (v) =>
    !v || ["es", "en", "pt"].includes(v) || "Invalid language code",

  /**
   * Bot command prefix validation
   * Optional, max 10 chars, no spaces
   */
  prefix: (v) => {
    if (!v) return true;
    if (v.length > 10) return "Maximum 10 characters";
    if (/\s/.test(v)) return "No spaces allowed";
    return true;
  },

  /**
   * No whitespace allowed
   */
  noSpaces: (v) => !v || !/\s/.test(v) || "No spaces allowed",

  /**
   * Range validator
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   */
  range: (min, max) => (v) => {
    const num = parseFloat(v);
    return (
      (!isNaN(num) && num >= min && num <= max) ||
      `Must be between ${min} and ${max}`
    );
  },

  /**
   * Match pattern validator
   * @param {RegExp} pattern - Regular expression to match
   * @param {string} message - Error message
   */
  pattern: (pattern, message) => (v) =>
    !v || pattern.test(v) || message || "Invalid format",

  /**
   * Must match another field (for password confirmation)
   * @param {string} matchValue - Value to match against
   */
  match:
    (matchValue, message = "Values must match") =>
    (v) =>
      v === matchValue || message,
};

/**
 * Combine multiple rules into one
 * @param  {...Function} ruleFns - Rule functions to combine
 * @returns {Function} Combined rule function
 */
export function combine(...ruleFns) {
  return (v) => {
    for (const rule of ruleFns) {
      const result = rule(v);
      if (result !== true) return result;
    }
    return true;
  };
}

/**
 * Create a conditional rule that only runs if condition is met
 * @param {Function} condition - Function that returns boolean
 * @param {Function} rule - Rule to apply if condition is true
 */
export function when(condition, rule) {
  return (v) => {
    if (!condition(v)) return true;
    return rule(v);
  };
}

export default {
  rules,
  combine,
  when,
};
