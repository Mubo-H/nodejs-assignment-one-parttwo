const fs = require("fs");
const path = require("path");

// Path to the data file
const itemsFilePath = path.join(__dirname, "data", "items.json");

// Read items from the JSON file
function readItems() {
  try {
    const data = fs.readFileSync(itemsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return []; // Return an empty array if file is not available or if there's an error
  }
}

// Write items to the JSON file
function writeItems(items) {
  try {
    fs.writeFileSync(itemsFilePath, JSON.stringify(items, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to file:", error);
  }
}

// Get item by ID
function getItemById(id) {
  const items = readItems();
  return items.find((item) => item.id === id);
}

// Validate item attributes
function validateItem(item) {
  if (!item.name || typeof item.name !== "string") {
    return "Item name is required and should be a string.";
  }
  if (!item.price || typeof item.price !== "number" || item.price <= 0) {
    return "Item price is required and should be a positive number.";
  }
  if (!item.size || !["s", "m", "l"].includes(item.size)) {
    return "Item size must be one of: s, m, l.";
  }
  return null; // No errors
}

module.exports = { readItems, writeItems, getItemById, validateItem };
