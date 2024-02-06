const cleanText = (inputText) => {
  // return inputText.replaceAll('\n', ' ').replaceAll('\r\n',' ')
  // return inputText.replaceAll('\n', ' ')
  return inputText.replace('"', "");
};

/**
 *
 * @param {*} text
 * @returns
 */
const determineAgent = (text: string) => {
  try {
  text = text.replaceAll("\n", " ");
  console.log('------------>')
  const match = /\[(.*?)\]:\s*(.*?)(?=\s*\[|$)/.exec(text);
  
  if (match.length < 3) {
    throw new Error(`Could not parse LLM output: ${text}`);
  }
  const employee = match[1].trim().replaceAll(":", "").replaceAll('[',"").replaceAll(']',"")
  const answer = match[2].trim().replaceAll("EmployeeAnswer", "").replaceAll(':',"")

  if (!answer) {
    throw new Error(`Could not parse LLM output: ${text}`);
  }


    return {
      tool: employee,
      answer,
      log: cleanText(text),
    };
  } catch (e) {
    return {
      tool: null,
      answer:null,
      error: e.message,
    };
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