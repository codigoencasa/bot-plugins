/**
 * 
 * @param inputText 
 * @returns 
 */
const cleanText = (inputText: string) => {
  return inputText.replace('"', "");
};

/**
 * 
 * @param text 
 * @returns 
 */
const determineAgent = (text: string): undefined | { tool: string, answer: string, log: string } => {
  try {
    text = text.replaceAll("\n", " ");
    const match = /\[(.*?)\]:\s*(.*?)(?=\s*\[|$)/.exec(text);

    if (match.length < 3) {
      throw new Error(`Could not parse LLM output: ${text}`);
    }
    const tool = match[1].trim().replaceAll(":", "").replaceAll('[', "").replaceAll(']', "")
    const answer = match[2].trim().replaceAll("EmployeeAnswer", "").replaceAll(':', "")

    if (!answer) {
      throw new Error(`Could not parse LLM output: ${text}`);
    }

    return {
      tool,
      answer,
      log: cleanText(text),
    };
  } catch (e) {
    return undefined
  }
};

/**
 *
 * @param {*} agentName
 * @param {*} agentsList
 * @returns
 */
const getAgent = (agentName: string, agentsList: any[]) => {
  const indexAgent = agentsList.findIndex((agent) => agent.name === agentName);
  return agentsList[indexAgent];
};

export { determineAgent, getAgent, cleanText };
