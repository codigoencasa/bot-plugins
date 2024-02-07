import { EmployeesClass } from "./plugin.employees"; // up version
import { Setting } from "./types";

/**
 *
 * @param  {Object}  settings
 * @param  {String}  settings.model    model gpt-3.5-turbo
 * @param  {Array}   settings.temperature  0
 * @param  {Integer} settings.apiKey     your api key opena
 * @returns
 */
const init = (settings: Setting) => {
  return new EmployeesClass(settings);
};

export { init };
