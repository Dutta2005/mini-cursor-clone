import { OpenAI } from 'openai'
import { exec } from 'node:child_process';
import readline from 'node:readline';
import dotenv from 'dotenv';
dotenv.config();


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new OpenAI({
    apiKey: OPENAI_API_KEY
});

function getWeatherInfo(city) {
    return new Promise((resolve, reject) => {
        exec(`curl -s "https://wttr.in/${city}?format=3"`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error fetching weather: ${error.message}`);
            } else if (stderr) {
                reject(`Error fetching weather: ${stderr}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

 // Only for Linux/MacOS
// For Windows, it will not work as expected
 function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                 return reject(error);
            }

            resolve(`stdout: ${stdout}\nstderr: ${stderr}`)
        });
    });
}

const TOOLS_MAP = {
    getWeatherInfo: getWeatherInfo,
    executeCommand: executeCommand
}

const SYSTEM_PROMPT = `
    You are  helpful AI assistant who is designed to resolve user query.
    You work on START, THINK, ACTION, OBSERVE and OUTPUT mode.

    In the START phase user gives a query to you then you THINK how to resolve the query at least 3-4 times and make sure that all is clear. If there is a need to call a tool, you call an ACTION event with tool and input parameters. If there is an ACTION call, wait for the OBSERVE that is output of the tool. Based on the OBSERVE from the previous step, you either OUTPUT or repeat the loop.

    Rules:
    - Always wait for next step.
    - Always output a single step and wait for the next step.
    - Output must be strictly JSON.
    - Only call tool action from Available tools.
    - Strictly follow the output format in JSON.

    Available tools
    - getWeatherInfo(string): Return string
    - executeCommand(command): Return string  Executes a given Linux command on user's device and return the stdout and stderr

    Example:
    START: What is weather of Kaliyaganj?
    THINK: The user is asking for the weather of Kaliyaganj.
    THINK: From the available tools, I must call getWeatherInfo tool for the city Kaliyaganj.
    ACTION: Call tool getWeatherInfo(city: "Kaliyaganj")
    OBSERVE: 30 degree C.
    THINK: The output of getWeatherInfo tool is 30 degree C
    OUTPUT: Hey, The weather of Kaliyaganj is 30 degree C which is quite hot 🥵.

    Output Example:
    {
    "role": "user",
    "content": "What is weather of Kaliyaganj?"
    }
    {
    "step": "think",
    "content": "The user is asking for the weather of Kaliyaganj."
    }
    {
    "step": "think",
    "content": "From the available tools, I must call getWeatherInfo tool for the city Kaliyaganj."
    }
    {
    "step": "action",
    "tool": "getWeatherInfo",
    "input": "Kaliyaganj"
    }
    {
    "step": "observe",
    "content": "30 degree C."
    }
    {
    "step": "think",
    "content": "The output of getWeatherInfo tool is 30 degree C"
    }
    {
    "step": "output",
    "content": "Hey, The weather of Kaliyaganj is 30 degree C which is quite hot 🥵."
    }


    Output format: 
    {
        "step": "string",
        "tool": "string",
        "input": "string",
        "content": "string"
    }
`




async function init() {
    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
    ];

    // use readline to get user input
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const useQruery = await new Promise((resolve) => {
        rl.question('Please enter your query: ', (query) => {
            resolve(query);
            rl.close();
        });
    });
    messages.push({
        role: "user",
        content: useQruery
    });

    while (true) {
        const response = await client.chat.completions.create({
            model: "gpt-4.1",
            response_format: { type: 'json_object' },
            messages: messages
        })

        messages.push({
            role: "assistant",
            content: response.choices[0].message.content
        })
        const paresedResponse = JSON.parse(response.choices[0].message.content);

        if (paresedResponse.step && paresedResponse.step === "think") {
            console.log(`🧠: ${paresedResponse.content}`);
            continue;
        }
        if (paresedResponse.step && paresedResponse.step === "output") {
            console.log(`🤖: ${paresedResponse.content}`);
            break;
        }
        if (paresedResponse.step && paresedResponse.step === "action") {
            const tool = paresedResponse.tool;
            const input = paresedResponse.input;


            const value = await TOOLS_MAP[tool](input)
            console.log(`🔧: Tool call ${tool} :(${input}) : ${value}`);

            messages.push({
                role: "assistant",
                content: JSON.stringify({
                    step: "observe",
                    content: await value
                })
            });
            continue;
        }
    }
}

init()