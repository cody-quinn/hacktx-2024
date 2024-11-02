import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  client: "@hey-api/client-axios",
  input: "http://localhost:8000/api/openapi.json",
  output: {
    format: "prettier",
    path: "./src/client",
  },
  plugins: ["@tanstack/react-query"],
});
