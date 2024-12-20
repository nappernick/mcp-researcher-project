import { beforeAll } from "bun:test";

beforeAll(() => {
  // Enable JSON imports
  process.env.NODE_OPTIONS = "--experimental-json-modules";
}); 