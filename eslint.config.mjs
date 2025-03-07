import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["dist/*"],
}, ...compat.extends(
    "prettier",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslintEslintPlugin,
    },

    languageOptions: {
        ecmaVersion: 2022,
        sourceType: "script",

        parserOptions: {
            ecmaFeatures: {},
        },
    },

    settings: {},

    rules: {
        "space-before-function-parens": 0,
        "@typescript-eslint/no-unused-vars": "error",
        "import/export": 0,
        "@typescript-eslint/ban-ts-comment": "warn",
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
    },
}];