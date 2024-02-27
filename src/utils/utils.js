import * as _ from "lodash";

/**
 *
 * @param {*} data API raw data
 * @returns nested result object
 */
export const getResultFromData = (data) => data?.data?.data?.result;

/**
 *
 * @param {*} data API error data
 * @returns nested error object
 */
export const getErrorResultFromData = (data) => data?.error?.response?.data;

/**
 * @param {*} data camelCase String
 * @returns Capitalized Spaced String
 */
export const getCapitallisedFromCamelCase = (data) => {
    let regex = /([^A-Za-z0-9.$])|([A-Z])(?=[A-Z][a-z])|([^\-$.0-9])(?=\$?[0-9]+(?:\.[0-9]+)?)|([0-9])(?=[^.0-9])|([a-z])(?=[A-Z])/g;

    return _.startCase(_.toLower(data.replace(regex, "$2$3$4$5 ")));
};

/**
 * @param {*} data String with spaces
 * @returns string with removed spaces
 */
export const removeSpaces = (data) => data.split(" ").join("").toLowerCase().trim();

/**
 *
 * @param {*} input Date as yyyy-MM-dd format
 * @returns Date as dd-MM-yyyy format
 */
export const formatDate__ddMMyyyy = (input = "") => {
    const datePart = input.match(/\d+/g);
    const year = datePart[0]?.substring(0, 4),
        month = datePart[1],
        day = datePart[2];

    return day + "/" + month + "/" + year;
};

/**
 *
 * @param {*} input Date as dd-MM-yyyy format
 * @returns Date as yyyy-MM-dd format
 */
export const formatDate__yyyyMMdd = (input = "") => {
    if (typeof input === "number" || typeof input === "object") {
        return input;
    } else {
        const datePart = input?.slice(0, 10).match(/\d+/g);
        const year = datePart[2].substring(0, 4),
            month = datePart[1],
            day = datePart[0];
        return year + "/" + month + "/" + day;
    }
};

/**
 *
 * @param {*} input Form elements list **HTMLFormControlsCollection**
 * @returns Values from elements list
 */
export const getFormValues = (input = {}, ...propNames) => {
    const values = {};

    for (let i of propNames) {
        if (input[i]) {
            values[i] = input[i].value;
        }
    }

    return values;
};
/**
 *
 * @param {*} arr Array to get injected with unique ID
 * @returns
 */

export const injectID = (arr = []) => {
    return arr.map((item) => {
        if (typeof item === "object" && item instanceof Object) {
            return { data: { ...item }, id: crypto?.randomUUID?.() };
        } else if (typeof item === "string" || typeof item === "number") {
            return { data: item, id: crypto?.randomUUID?.() };
        }
    });
};

/**
 *
 * @param {*} arg String argument of the form "1000.00"
 * @returns Numeric Form of the same
 */

export const formatStringAmountToNumeric = (arg = "") => {
    if (typeof arg === "string") {
        return +arg.split(".")[0].split(",").join("");
    } else {
        throw new Error("Function accepts only string");
    }
};

/**
 * Error Code Helper Object
 */
export const ERROR_CODES = {
    400: "BAD REQUEST",
    404: "RESOURCE NOT FOUND",
    500: "INTERNAL SERVER ERROR",
    200: "SUCCESSFULL",
};
