import path from "path";
import config from "@folio/jest-config-stripes";

const jestConfig = {
  ...config,
  setupFiles: [
    ...config.setupFiles,
    path.join(import.meta.dirname, './test/jest/setupFiles.js'),
  ],
};

export default jestConfig;

