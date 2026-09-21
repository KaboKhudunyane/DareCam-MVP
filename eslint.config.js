import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
export default [{ ignores: ['dist', 'assets'] }, { files: ['**/*.ts'], languageOptions: { parser }, plugins: { '@typescript-eslint': tseslint }, rules: { '@typescript-eslint/no-explicit-any': 'error', 'no-unused-vars': 'off' } }];
