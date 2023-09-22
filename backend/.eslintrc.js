module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 13,
    },
    rules: {
        camelcase: 'off',
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-await-in-loop': 'off',
        'no-param-reassign': 'off',
        'class-methods-use-this': 'off',
        'func-names': 'off',
        radix: 'off',
        'no-restricted-syntax': ['error', 'WithStatement', "BinaryExpression[operator='in']"],
        'linebreak-style': ['error', 'windows'],
    },
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@config', './config'],
                    ['@util', './util'],
                    ['@services', './services'],
                    ['@lib', './lib'],
                    ['@errors', './errors'],
                    ['@models', './models'],
                ],
                extensions: ['.js'],
            },
        },
    },
};
