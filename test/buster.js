var config = exports;

config["Browser tests"] = {
    rootPath: "../",
    environment: "browser",
    libs: [
        'test/lib/mootools-yui-compressed.js',
        'test/lib/es5-shim.min.js',
        'test/lib/syn.js'
    ],
    sources: [
        "src/*..js"
    ],
    tests: [
        "test/tests/*-test.js"
    ]
};
