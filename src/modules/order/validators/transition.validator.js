const AppError = require("../../../errors/AppError");

/**
 * Validates the transition between two states
 * 
 * @param {Object} transitions - The transition matrix
 * @param {string} from - The current state
 * @param {string} to - The target state
 * @param {string} type - The type of state (default: "Status")
 */
function validateTransition(transitions, from, to, type = "Status") {
  if (from === to) return;

  const allowed = transitions[from];

  if (!allowed || !allowed.includes(to)) {
    throw new AppError(
      `${type} cannot be changed from ${from} to ${to}`,

      409,
    );
  }
}

module.exports = validateTransition;
