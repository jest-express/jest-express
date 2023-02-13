module.exports = {
    extends: [
        'airbnb-base',
        'airbnb-typescript/base'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json'
    },
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        "import/no-import-module-exports": "off",
        "no-restricted-syntax": "off",
        "no-constructor-return": "off",
        "import/prefer-default-export": "off",
        "import/no-cycle": "off",
        "consistent-return": "off",
        "no-multi-assign": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "no-return-assign": "off",
        "implicit-arrow-linebreak": "off",
    }
};