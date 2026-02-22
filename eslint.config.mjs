// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['out/**', 'dist/**', '**/*.d.ts']
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/naming-convention': 'warn',
            'curly': 'warn',
            'eqeqeq': 'warn',
            'no-throw-literal': 'warn',
        }
    },
    {
        files: ['webpack.config.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                __dirname: 'readonly',
                module: 'readonly'
            }
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off'
        }
    }
);
