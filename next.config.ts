import type { NextConfig } from "next";

const NEXT_CONFIG: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH ?? "",
};

export default NEXT_CONFIG;
