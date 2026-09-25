const fs = require('fs');
const path = require('path');

const FAKER_VERSION = '10.5.0';
const PATCH_MARKER = 'ensureFakerCompatibility(faker)';
const LOADER_MARKER = 'function loadFakerModule()';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function patchPackageJson(packageRoot) {
  const packageJsonPath = path.join(packageRoot, 'package.json');
  const packageJson = readJson(packageJsonPath);

  if (!packageJson.dependencies || packageJson.dependencies['@faker-js/faker'] === FAKER_VERSION) {
    return;
  }

  packageJson.dependencies['@faker-js/faker'] = FAKER_VERSION;
  writeJson(packageJsonPath, packageJson);
}

function patchFakerFallback(packageRoot) {
  const filePath = path.join(packageRoot, 'lib', 'superstring', 'faker-fallback.js');
  const source = `'use strict';

function arrayElement(values) {
    return values[Math.floor(Math.random() * values.length)];
}

function int(options) {
    var min = options && typeof options.min === 'number' ? options.min : 0,
        max = options && typeof options.max === 'number' ? options.max : 99999;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function numeric(length) {
    var value = '';

    while (value.length < length) {
        value += int({ min: 0, max: 9 });
    }

    return value;
}

function alphanumeric(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        value = '',
        i;

    for (i = 0; i < length; i++) {
        value += chars.charAt(int({ min: 0, max: chars.length - 1 }));
    }

    return value;
}

function word() {
    return arrayElement(['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot']);
}

function words(count) {
    var result = [],
        length = typeof count === 'number' ? count : 3,
        i;

    for (i = 0; i < length; i++) {
        result.push(word());
    }

    return result.join(' ');
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
        var value = int({ min: 0, max: 15 });

        if (char === 'y') {
            value = (value & 0x3) | 0x8;
        }

        return value.toString(16);
    });
}

function date(offset) {
    return new Date(Date.now() + offset);
}

function url(category) {
    return 'https://example.com/' + (category || word()) + '/' + alphanumeric(8);
}

var faker = {
    helpers: {
        arrayElement: arrayElement
    },
    location: {
        city: function () { return words(2); },
        street: function () { return words(2); },
        streetAddress: function () { return int({ min: 1, max: 9999 }) + ' ' + words(2); },
        country: function () { return arrayElement(['United States', 'India', 'Germany', 'Japan']); },
        countryCode: function () { return arrayElement(['US', 'IN', 'DE', 'JP']); },
        latitude: function () { return (Math.random() * 180 - 90).toFixed(6); },
        longitude: function () { return (Math.random() * 360 - 180).toFixed(6); }
    },
    word: {
        sample: word
    },
    string: {
        alphanumeric: function (length) { return alphanumeric(length || 1); },
        numeric: function (length) { return numeric(length || 1); },
        uuid: uuid
    },
    number: {
        int: int
    },
    phone: {
        number: function () { return '(' + numeric(3) + ') ' + numeric(3) + '-' + numeric(4); }
    },
    color: {
        human: function () { return arrayElement(['red', 'green', 'blue', 'black']); },
        rgb: function () { return '#' + int({ min: 0, max: 0xffffff }).toString(16).padStart(6, '0'); }
    },
    commerce: {
        department: function () { return arrayElement(['Books', 'Tools', 'Games', 'Garden']); },
        productName: function () { return words(3); },
        productAdjective: word,
        productMaterial: function () { return arrayElement(['Steel', 'Plastic', 'Cotton', 'Wood']); },
        product: function () { return arrayElement(['Chair', 'Table', 'Shirt', 'Bag']); }
    },
    company: {
        name: function () { return words(2) + ' Inc'; },
        catchPhrase: function () { return words(5); },
        catchPhraseAdjective: word,
        catchPhraseDescriptor: word,
        catchPhraseNoun: word,
        buzzPhrase: function () { return words(3); },
        buzzAdjective: word,
        buzzVerb: word,
        buzzNoun: word
    },
    database: {
        column: word,
        type: function () { return arrayElement(['varchar', 'int', 'timestamp']); },
        collation: function () { return 'utf8_general_ci'; },
        engine: function () { return arrayElement(['InnoDB', 'Memory', 'Archive']); }
    },
    date: {
        past: function () { return date(-86400000); },
        future: function () { return date(86400000); },
        recent: function () { return date(-3600000); },
        month: function () { return arrayElement(['January', 'February', 'March']); },
        weekday: function () { return arrayElement(['Monday', 'Tuesday', 'Wednesday']); }
    },
    finance: {
        accountName: function () { return words(2); },
        accountNumber: function () { return numeric(8); },
        amount: function () { return (Math.random() * 1000).toFixed(2); },
        transactionType: function () { return arrayElement(['deposit', 'withdrawal', 'payment']); },
        currencyCode: function () { return arrayElement(['USD', 'INR', 'EUR']); },
        currencyName: function () { return arrayElement(['US Dollar', 'Indian Rupee', 'Euro']); },
        currencySymbol: function () { return arrayElement(['$', 'Rs', 'EUR']); },
        bitcoinAddress: function () { return 'bc1' + alphanumeric(30).toLowerCase(); },
        iban: function () { return 'DE' + numeric(20); },
        bic: function () { return alphanumeric(8).toUpperCase(); }
    },
    hacker: {
        abbreviation: function () { return arrayElement(['HTTP', 'JSON', 'SQL']); },
        adjective: word,
        noun: word,
        verb: word,
        ingverb: function () { return word() + 'ing'; },
        phrase: function () { return words(5); }
    },
    image: {
        avatar: function () { return url('avatar'); },
        url: function () { return url('image'); },
        urlLoremFlickr: function (options) { return url(options && options.category); },
        dataUri: function () { return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='; }
    },
    internet: {
        email: function () { return word() + '@example.com'; },
        exampleEmail: function () { return word() + '@example.com'; },
        username: word,
        protocol: function () { return arrayElement(['http', 'https']); },
        url: function () { return url('site'); },
        domainName: function () { return word() + '.example'; },
        domainSuffix: function () { return arrayElement(['com', 'org', 'net']); },
        domainWord: word,
        ip: function () { return [int({ min: 1, max: 255 }), int({ min: 0, max: 255 }), int({ min: 0, max: 255 }), int({ min: 0, max: 255 })].join('.'); },
        ipv6: function () { return '2001:db8::' + int({ min: 1, max: 9999 }).toString(16); },
        userAgent: function () { return 'Mozilla/5.0'; },
        mac: function () { return [numeric(2), numeric(2), numeric(2), numeric(2), numeric(2), numeric(2)].join(':'); },
        password: function () { return alphanumeric(15); }
    },
    lorem: {
        word: word,
        words: words,
        sentence: function () { return words(6) + '.'; },
        slug: function () { return words(3).replace(/ /g, '-'); },
        sentences: function () { return words(6) + '. ' + words(6) + '.'; },
        paragraph: function () { return words(20) + '.'; },
        paragraphs: function () { return words(20) + '\\n\\n' + words(20) + '.'; },
        text: function () { return words(12); },
        lines: function () { return words(5) + '\\n' + words(5); }
    },
    person: {
        firstName: word,
        lastName: word,
        fullName: function () { return word() + ' ' + word(); },
        jobTitle: function () { return words(3); },
        prefix: function () { return arrayElement(['Mr.', 'Ms.', 'Dr.']); },
        suffix: function () { return arrayElement(['Jr.', 'MD', 'PhD']); },
        jobDescriptor: word,
        jobArea: word,
        jobType: word
    },
    system: {
        fileName: function () { return word() + '.txt'; },
        commonFileName: function () { return word() + '.txt'; },
        mimeType: function () { return 'text/plain'; },
        commonFileType: function () { return 'text'; },
        commonFileExt: function () { return 'txt'; },
        fileType: function () { return 'text'; },
        fileExt: function () { return 'txt'; },
        semver: function () { return int({ min: 0, max: 9 }) + '.' + int({ min: 0, max: 9 }) + '.' + int({ min: 0, max: 9 }); }
    },
    datatype: {
        boolean: function () { return Math.random() > 0.5; }
    }
};

module.exports = { faker: faker };
`;

  fs.writeFileSync(filePath, source);
}

function patchDynamicVariables(packageRoot) {
  const filePath = path.join(packageRoot, 'lib', 'superstring', 'dynamic-variables.js');
  let source = fs.readFileSync(filePath, 'utf8');

  source = source.replace(
    "var faker = require('@faker-js/faker/locale/en'),\n    uuid = require('uuid'),",
    "var fakerModule = loadFakerModule(),\n    faker = fakerModule.faker || fakerModule,\n    uuid = require('uuid'),"
  );

  source = source.replace(
    "var fakerModule = require('@faker-js/faker/locale/en'),\n    faker = fakerModule.faker || fakerModule,\n    uuid = require('uuid'),",
    "var fakerModule = loadFakerModule(),\n    faker = fakerModule.faker || fakerModule,\n    uuid = require('uuid'),"
  );

  if (!source.includes(PATCH_MARKER)) {
    source = source.replace(
      "    ],\n\n    // generators for $random* variables\n    dynamicGenerators = {",
      `    ];

function ensureFakerCompatibility(faker) {
    function bind(namespace, method) {
        return faker[namespace] && faker[namespace][method] && faker[namespace][method].bind(faker[namespace]);
    }

    function set(target, method, implementation) {
        if (target && !target[method] && implementation) {
            target[method] = implementation;
        }
    }

    function categoryImage(category) {
        return function () {
            if (faker.image.urlLoremFlickr) {
                return faker.image.urlLoremFlickr({ category: category });
            }

            return faker.image.url();
        };
    }

    faker.address = faker.address || {};
    set(faker.address, 'city', bind('location', 'city'));
    set(faker.address, 'streetName', bind('location', 'street'));
    set(faker.address, 'streetAddress', bind('location', 'streetAddress'));
    set(faker.address, 'country', bind('location', 'country'));
    set(faker.address, 'countryCode', bind('location', 'countryCode'));
    set(faker.address, 'latitude', bind('location', 'latitude'));
    set(faker.address, 'longitude', bind('location', 'longitude'));

    faker.random = faker.random || {};
    set(faker.random, 'arrayElement', bind('helpers', 'arrayElement'));
    set(faker.random, 'word', bind('word', 'sample'));
    set(faker.random, 'alphaNumeric', function () {
        return faker.string.alphanumeric(1);
    });

    faker.datatype = faker.datatype || {};
    set(faker.datatype, 'number', function (options) {
        return faker.number.int(options);
    });
    set(faker.datatype, 'uuid', bind('string', 'uuid'));

    faker.phone = faker.phone || {};
    set(faker.phone, 'phoneNumberFormat', function () {
        return faker.phone.number({ style: 'national' });
    });

    faker.commerce = faker.commerce || {};
    set(faker.commerce, 'color', bind('color', 'human'));

    faker.company = faker.company || {};
    set(faker.company, 'companyName', bind('company', 'name'));
    set(faker.company, 'companySuffix', function () {
        return faker.helpers.arrayElement(['Inc', 'LLC', 'Group']);
    });
    set(faker.company, 'bs', bind('company', 'buzzPhrase'));
    set(faker.company, 'bsAdjective', bind('company', 'buzzAdjective'));
    set(faker.company, 'bsBuzz', bind('company', 'buzzVerb'));
    set(faker.company, 'bsNoun', bind('company', 'buzzNoun'));

    faker.finance = faker.finance || {};
    set(faker.finance, 'account', bind('finance', 'accountNumber'));
    set(faker.finance, 'mask', function () {
        return '****-****-****-' + faker.string.numeric(4);
    });

    faker.image = faker.image || {};
    set(faker.image, 'imageUrl', bind('image', 'url'));
    set(faker.image, 'abstract', categoryImage('abstract'));
    set(faker.image, 'animals', categoryImage('animals'));
    set(faker.image, 'business', categoryImage('business'));
    set(faker.image, 'cats', categoryImage('cats'));
    set(faker.image, 'city', categoryImage('city'));
    set(faker.image, 'food', categoryImage('food'));
    set(faker.image, 'nightlife', categoryImage('nightlife'));
    set(faker.image, 'fashion', categoryImage('fashion'));
    set(faker.image, 'people', categoryImage('people'));
    set(faker.image, 'nature', categoryImage('nature'));
    set(faker.image, 'sports', categoryImage('sports'));
    set(faker.image, 'transport', categoryImage('transport'));

    faker.internet = faker.internet || {};
    set(faker.internet, 'userName', bind('internet', 'username'));
    set(faker.internet, 'color', function () {
        return '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
    });

    faker.name = faker.name || {};
    set(faker.name, 'firstName', bind('person', 'firstName'));
    set(faker.name, 'lastName', bind('person', 'lastName'));
    set(faker.name, 'findName', bind('person', 'fullName'));
    set(faker.name, 'jobTitle', bind('person', 'jobTitle'));
    set(faker.name, 'prefix', bind('person', 'prefix'));
    set(faker.name, 'suffix', bind('person', 'suffix'));
    set(faker.name, 'jobDescriptor', bind('person', 'jobDescriptor'));
    set(faker.name, 'jobArea', bind('person', 'jobArea'));
    set(faker.name, 'jobType', bind('person', 'jobType'));
}

ensureFakerCompatibility(faker);

// generators for $random* variables
var dynamicGenerators = {`
    );
  }

  if (!source.includes(LOADER_MARKER)) {
    source = source.replace(
      'function ensureFakerCompatibility(faker) {',
      `function loadFakerModule() {
    try {
        return require('@faker-js/faker/locale/en');
    }
    catch (error) {
        return require('./faker-fallback');
    }
}

function ensureFakerCompatibility(faker) {`
    );
  }

  if (!source.includes(PATCH_MARKER)) {
    throw new Error('Unable to patch postman-collection dynamic variables for @faker-js/faker@10.5.0');
  }

  fs.writeFileSync(filePath, source);
}

function main() {
  let packageRoot;

  try {
    packageRoot = path.dirname(require.resolve('postman-collection/package.json'));
  } catch (error) {
    return;
  }

  patchPackageJson(packageRoot);
  patchFakerFallback(packageRoot);
  patchDynamicVariables(packageRoot);
}

main();
