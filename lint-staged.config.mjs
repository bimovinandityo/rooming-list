const config = {
  "!(*.generated).{ts,tsx}": ["eslint --max-warnings=0"],
  "*.{ts,tsx,json,css,md}": ["prettier --write"],
};

export default config;
