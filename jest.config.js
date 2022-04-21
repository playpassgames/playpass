/* eslint-disable no-undef */
module.exports = {
    transform: {
        "^.+\\.(jsx?|tsx?)$": "esbuild-jest",
    },
    testMatch: ["<rootDir>/test/**/*.test.ts"],
    // collectCoverage: true,
    // collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
    transformIgnorePatterns: [ "/node_modules/?!(lit)/" ],
};
