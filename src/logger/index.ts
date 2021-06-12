import fs, { PathLike } from "fs";
/**
 * Append zero to length.
 * @param {string} value Value to append zero.
 * @param {number} length Needed length.
 * @returns {string} String with appended zeros id need it.
 */
const appendZeroToLength = (value: any, length: any) => {
  return `${value}`.padStart(length, "0");
};

/**
 * Get date as text.
 * @returns {string} Date as text. Sample: "2018.12.03, 07:32:13.0162 UTC".
 */
const getDateAsText = () => {
  const now = new Date();
  const nowText =
    appendZeroToLength(now.getFullYear(), 4) +
    "." +
    appendZeroToLength(now.getMonth() + 1, 2) +
    "." +
    appendZeroToLength(now.getDate(), 2) +
    ", " +
    appendZeroToLength(now.getHours(), 2) +
    ":" +
    appendZeroToLength(now.getMinutes(), 2) +
    ":" +
    appendZeroToLength(now.getSeconds(), 2) +
    "." +
    appendZeroToLength(now.getMilliseconds(), 4) +
    " Local";
  return nowText;
};

/**
 * Log to file.
 * @param {string} text Text to log.
 * @param {string} [file] Log file path.
 */

export const logToFile = (text: String, file?: PathLike) => {
  // Define file name.
  const filename = file !== undefined ? file : "default.log";

  // Define log text.
  const logText = getDateAsText() + " -> " + text + "\r\n";

  // Save log to file.
  fs.appendFile(filename, logText, "utf8", function (error) {
    if (error) {
      // If error - show in console.
      console.log(getDateAsText() + " -> " + error);
    }
  });
};
