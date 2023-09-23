const validator = require("validator").default;

/**
 * Supported request components for validation
 */
const validationComponents = ["query", "body", "headers", "params"];

/**
 * Supported type validators
 */
const typeValidator = {
    //map: Provides an object validator with individual validations for each key
    //func: Provides a function validator with custom function validation
    string: { value: (val) => { return (typeof val === "string") }, constraints: ["minLength", "maxLength"] },
    email: { value: (val) => validator.isEmail(val, { allow_display_name: true }) },
    phone: { value: (val) => /^\+?\d+$/.test(val) },
    url: { value: validator.isURL, constraints: ["minLength", "maxLength"] },
    decimal: { value: validator.isDecimal, constraints: ["minValue", "maxValue"] },
    number: { value: (val) => validator.isNumeric(val, { no_symbols: true }), constraints: ["minValue", "maxValue"] },
    alpha: { value: validator.isAlpha, constraints: ["minLength", "maxLength"] },
    alphaNumeric: { value: validator.isAlphanumeric, constraints: ["minLength", "maxLength"] },
    date: { value: (val) => validator.isDate(val, { delimiters: ['/', '-', '.']}), constraints: ["minDate", "maxDate"] }, //default format: YYYY-MM-DD or YYYY/MM/DD
    uuid: { value: (val) => validator.isUUID(val, 4) },
    array: { value: (val) => Array.isArray(val), constraints: ["possibleValues"] }
};

const constraintValidator = {
    minLength: (val, limit) => (val.length >= limit),
    maxLength: (val, limit) => (val.length <= limit),
    minValue: (val, limit) => (Number(val) >= limit),
    maxValue: (val, limit) => (Number(val) <= limit),
    minDate: (val, limit) => (new Date(val) >= new Date(limit)),
    maxDate: (val, limit) => (new Date(val) <= new Date(limit)),
    possibleValues: (array, allowedValues) => {
        for (const val of array) {
            if(!allowedValues.includes(val)) return false;
        }
        return true;
    }
}

/**
 * Generates and returns a RequestHandler for spec validation
 * @param {{query?: JSON, body?: JSON, header?: JSON}} specs 
 */
function getSpecValidator(specs) {
    return (req, res, logger, next) => {
        let validationErrors = []

        for (const key of validationComponents) {
            let componentValidationErrors = [];
            if (specs[key]) {
                componentValidationErrors = validateData(specs[key], req[key]);
            }
            if (componentValidationErrors.length > 0) {
                if (process.env.ENV.toLocaleLowerCase() === "dev") {
                    //Maintaining all errors for DEV environment
                    validationErrors.push(...componentValidationErrors);
                } else {
                    validationErrors.push(componentValidationErrors[0]);
                    break;
                }
            }
        }

        if (validationErrors.length > 0) {
            res.status(400).send(`Validation failure(s):\n${validationErrors.join("\n")}`);
        } else {
            next();
        }
    }
}

/**
 * Validates `data` against the `spec` passed
 * @param {{ 
 *  requiredKeys: Array<string>, 
 *  optionalKeys?: Array<string>, 
 *  validations:{ dataKey: {type: string, maxLength?: number, minLength?: number } }
 * }} spec 
 * @param {JSON} data 
 * @returns {string[]} validationError
 */
function validateData(spec, data) {
    let validationErrors = [];

    spec = validateSpec(spec);

    //Validate mandatory fields
    for (const key of spec.requiredKeys) {
        if (!spec.validations[key]) throw new Error(`Validation not specified for key: ${key}`);
        const validationError = validateParam(key, data[key], spec.validations[key]);
        if (validationError) {
            validationErrors.push(validationError);
        }
    }

    //Validate non-mandatory fields
    for (const key of spec.optionalKeys) {
        if (!spec.validations[key]) throw new Error(`Validation not specified for key: ${key}`);
        if (!data.hasOwnProperty(key)) continue;
        const validationError = validateParam(key, data[key], spec.validations[key]);
        if (validationError) {
            validationErrors.push(validationError);
        }
    }

    return validationErrors;
}

function validateSpec(spec) {
    let temp = {...spec};
    //Set empty array for keys if not set
    if (common.isSet(spec.requiredKeys)) {
        if (!Array.isArray(spec.requiredKeys) || spec.requiredKeys.length < 1) {
            throw new Error(`requiredKeys must be a valid array of all the mandatory fields! 
                Found: ${Array.isArray(spec.requiredKeys) ? 'array': typeof spec.requiredKeys}`);
        }
    } else {
        temp.requiredKeys = [];
    }

    if (common.isSet(spec.optionalKeys)) {
        if (!Array.isArray(spec.optionalKeys) || spec.optionalKeys.length < 1) {
            throw new Error(`optionalKeys if specified must be a valid array of all the expected non-mandatory fields! 
                Found: ${Array.isArray(spec.requiredKeys) ? 'array': typeof spec.requiredKeys}`);
        }
    } else {
        temp.optionalKeys = [];
    }

    return temp;
}

/**
 * Validates the `key`'s value against the `specValidations` passed
 * @param {string} key 
 * @param {string} value 
 * @param {{type: string, maxLength?: number, minLength?: number }} validation 
 * @param {boolean} isMandatory - defaults to `true`
 * @returns {string|undefined} errorMessage
 */
function validateParam(key, value, validation) {
    const normalizedValue = validation.type === "string" ? value : normalizeData(validation.type, value);
    if (!normalizedValue) {
        return `"${key}" empty or undefined`;
    } else {
        let error;
        if (validation.type === "map") {
            const validationErrors = validateData(validation.spec, value);
            if (validationErrors.length > 0) {
                error =`Invalid "${key}". Errors: ${validationErrors.join(", ")}`;
            }
            return error;
        } else if (validation.type === "func") {
            if (!validation.func(value)) {
                error = `Invalid "${key}". Expected validation(s) failed`;
            }
            return error;
        } else if (!typeValidator[validation.type]) {
            throw new Error(`Invalid type: ${validation.type} specified for "${key}"`);
        }

        const specificTypeValidator = typeValidator[validation.type]

        if (!specificTypeValidator.value(normalizedValue)) {
            error = `Invalid "${key}". Expected type: ${validation.type}`;
        } else if (specificTypeValidator.constraints) {
            for (const constraint of specificTypeValidator.constraints) {
                const specificConstraint = validation[constraint];
                if (common.isSet(specificConstraint) && constraintValidator[constraint] 
                    && !constraintValidator[constraint](normalizedValue, specificConstraint)) {
                    error = `Invalid "${key}". Expected constraint ${constraint} failed`;
                    break;
                }
            }
        }

        return error;
    }
}

/**
 * Returns normalized `data` basis the `type` passed
 * Used validator module requires string values
 * @param {string} type 
 * @param {*} data 
 * @returns {string|undefined} value
 */
function normalizeData(type, data) {
    if (common.isSet(data)) {
        switch (type) {
            case "func":
            case "map":
            case "array":
                return data;
            default:
                return data.toString();
        }
    }
}

module.exports = {
    getSpecValidator: getSpecValidator
};