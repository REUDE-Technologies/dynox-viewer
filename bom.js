// RTS Compact 5 — prices for the bill of materials.
// Set a unit price in INR when it is known. Leave null to keep the line as "to be updated".
// The sheet multiplies unit price by the quantity in catalog.js and skips null prices in the total.
// Items 15–17 are the reference motor and propeller shown on the model, not the stand itself.

export const CURRENCY = 'INR';

export const PRICES = {
  1: null,  // Base extrusion 40×120
  2: null,  // Bench clamps
  3: null,  // End stoppers
  4: null,  // Base cross members 4040
  5: null,  // Mast 4040 × 400
  6: null,  // Corner brackets
  7: null,  // Cross arm 4040
  8: null,  // Carry handles
  9: null,  // Load-cell bracket
  10: null, // Thrust load cell
  11: null, // Torque cell holder
  12: null, // Torque load cells
  13: null, // Torque arms and spacers
  14: null, // Motor mount plate
  15: null, // Motor (MN4110 reference)
  16: null, // Propeller adapter (MF1302)
  17: null, // Folding propeller blades (CW)
  18: null, // RPM sensor and arm
  19: null, // Vibration sensor board
  20: null, // Current sensor module
  21: null, // T-nuts (printed, series 8)
  22: null, // M8 socket cap screws
  23: null, // M3 screws
};

// Shown on the model as the example test article. Not part of the stand kit.
export const REFERENCE = new Set([15, 16, 17]);
