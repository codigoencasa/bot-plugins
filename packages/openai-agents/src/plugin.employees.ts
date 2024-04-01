import type { BotMethods } from "@builderbot/bot/dist/types";
import { determineAgent } from "./determine";
import { buildPromptEmployee } from "./employee.rol";
import OpenAiClass from "./openai.class";
import { Employee, Setting } from "./types";

class EmployeesClass extends OpenAiClass {
  listEmployees: Employee[] = [];

  constructor(_settings: Setting) {
    super(_settings);
  }

  /**
   *
   * @param {*} employees [] array
   */
  employees = (employees: Employee[] = []) => this.listEmployees = employees;

  /**
   *
   * @param {*} employeeName
   * @returns
   */
  getAgent = (employeeName: string) => {
    const indexEmployee = this.listEmployees.findIndex(
      (emp) => emp.name === employeeName
    );
    return this.listEmployees[indexEmployee];
  };

  /**
   *
   */
  determine = async (text: string) => {
    try {

      const messages = [
        {
          role: "system",
          content: buildPromptEmployee(this.listEmployees),
        },
        {
          role: "user",
          content: text,
        },
      ]


      const llmDetermineEmployee = await this.sendChat(messages);

      if (llmDetermineEmployee?.error) {
        throw new Error(llmDetermineEmployee?.error?.message)
      }

      const bestChoise = determineAgent(
        llmDetermineEmployee.choices[0].message.content
      );

      const employee = this.getAgent(`${bestChoise?.tool}`);
      return { employee, answer: bestChoise.answer };

    } catch (err) {
      console.log({ err })
      return undefined
    }
  };

  /**
   * @param {*} employee 
   * @param {*} ctxFn 
   */
  gotoFlow = (employee: Employee,
    ctxFn: BotMethods) => {
    const flow = employee.flow
    ctxFn.gotoFlow(flow)
  }
}

export { EmployeesClass };
