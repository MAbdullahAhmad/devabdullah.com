const config = {
  '*.{js,mjs,cjs,jsx,ts,tsx}': (files) => {
    const portfolioFiles = files.filter((file) => !file.includes('/template/'));

    if (portfolioFiles.length === 0) return [];

    const paths = portfolioFiles.map((file) => JSON.stringify(file)).join(' ');
    return [
      `eslint --fix --max-warnings=0 ${paths}`,
      `prettier --write ${paths}`,
    ];
  },
  '*.{json,css,md,yml,yaml}': 'prettier --write --ignore-unknown',
};

export default config;
