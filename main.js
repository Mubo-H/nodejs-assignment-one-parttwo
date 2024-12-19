const http = require("http");
const fs = require("fs");
const url = require("url");
const { parse } = require("querystring");
const {
  readItems,
  writeItems,
  getItemById,
  validateItem,
} = require("./support");

// Define the server and routing logic
const server = http.createServer((req, res) => {
  const { method, url: reqUrl } = req;
  const parsedUrl = url.parse(reqUrl, true);

  // Set common headers
  res.setHeader("Content-Type", "application/json");

  // Handle different routes
  if (method === "GET" && parsedUrl.pathname === "/items") {
    // Get all items
    const items = readItems();
    return res.end(JSON.stringify({ success: true, data: items }));
  }

  if (method === "GET" && parsedUrl.pathname.startsWith("/items/")) {
    // Get one item by ID
    const itemId = parsedUrl.pathname.split("/")[2];
    const item = getItemById(itemId);

    if (item) {
      return res.end(JSON.stringify({ success: true, data: item }));
    } else {
      return (
        (res.statusCode = 404),
        res.end(JSON.stringify({ success: false, message: "Item not found" }))
      );
    }
  }

  if (method === "POST" && parsedUrl.pathname === "/items") {
    // Create a new item
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const newItem = JSON.parse(body);
      const validationError = validateItem(newItem);
      if (validationError) {
        return (
          (res.statusCode = 400),
          res.end(JSON.stringify({ success: false, message: validationError }))
        );
      }

      const items = readItems();
      newItem.id = Date.now().toString();
      items.push(newItem);
      writeItems(items);

      return res.end(JSON.stringify({ success: true, data: newItem }));
    });
  }

  if (method === "PUT" && parsedUrl.pathname.startsWith("/items/")) {
    // Update an existing item by ID
    const itemId = parsedUrl.pathname.split("/")[2];
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const updatedItem = JSON.parse(body);
      const validationError = validateItem(updatedItem);
      if (validationError) {
        return (
          (res.statusCode = 400),
          res.end(JSON.stringify({ success: false, message: validationError }))
        );
      }

      const items = readItems();
      const itemIndex = items.findIndex((item) => item.id === itemId);

      if (itemIndex === -1) {
        return (
          (res.statusCode = 404),
          res.end(JSON.stringify({ success: false, message: "Item not found" }))
        );
      }

      items[itemIndex] = { ...items[itemIndex], ...updatedItem };
      writeItems(items);

      return res.end(JSON.stringify({ success: true, data: items[itemIndex] }));
    });
  }

  if (method === "DELETE" && parsedUrl.pathname.startsWith("/items/")) {
    // Delete an item by ID
    const itemId = parsedUrl.pathname.split("/")[2];
    const items = readItems();
    const itemIndex = items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return (
        (res.statusCode = 404),
        res.end(JSON.stringify({ success: false, message: "Item not found" }))
      );
    }

    items.splice(itemIndex, 1);
    writeItems(items);

    return res.end(
      JSON.stringify({ success: true, message: "Item deleted successfully" })
    );
  }

  // Fallback for invalid routes
  res.statusCode = 404;
  return res.end(
    JSON.stringify({ success: false, message: "Route not found" })
  );
});

// Start the server
const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
