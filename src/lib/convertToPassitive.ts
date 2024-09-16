import { Request } from "express";

export function convertToPassitive(req: Request) {
  const obj = req.body;
  Object.keys(obj).forEach((key) => {
    let value = obj[key];
    if (
      typeof value === "string" &&
      !isNaN(parseFloat(value.replace(/,/g, "")))
    ) {
      if (value.startsWith("-")) {
        obj[key] = value.slice(1); // Ensure the value remains a string
      }
    }
  });
  req.body = obj;
}
