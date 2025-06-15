# mini-cursor-clone

A minimal command-line AI assistant that uses OpenAI's GPT model to process user queries, think through solutions, and call tools such as weather lookup and shell command execution.

## How It Works

- The assistant runs in your terminal and prompts you for a query.
- It uses a system prompt to guide the AI through a step-by-step reasoning process: **START**, **THINK**, **ACTION**, **OBSERVE**, and **OUTPUT**.
- If a tool is needed (like getting weather info or running a shell command), the assistant calls the appropriate function and observes the result before continuing.
- All interactions are formatted as JSON for clarity and structure.

## Available Tools

- `getWeatherInfo(city)`: Fetches the weather for a given city using [wttr.in](https://wttr.in).  
  **Note:** This tool works on macOS, Linux, and Windows.
- `executeCommand(command)`: Executes a shell command and returns the output.  
  **Note:** This tool works only on macOS and Linux. It does **not** work on Windows.

## Requirements

- Node.js (v18+ recommended)
- An OpenAI API key

## Setup

1. Clone the repository.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```
4. Run the assistant:
   ```sh
   npm run dev
   ```

## Important Notes

- The `getWeatherInfo` tool works on all major platforms (macOS, Linux, Windows).
- The `executeCommand` tool is only supported on macOS and Linux.  
  It will **not** work on Windows due to differences in shell command execution.

## Example Usage

### Weather Info

```
Please enter your query: What is the weather in Kolkata?
🧠: The user wants to know the current weather in Kolkata.
🧠: Based on the available tools, I should use getWeatherInfo to fetch the weather details for Kolkata.
🔧: Tool call getWeatherInfo :(Kolkata) : Kolkata: 🌫  +30°C
🧠: The tool returned that the weather in Kolkata is cloudy or foggy with a temperature of 30°C.
🤖: Hey, the current weather in Kolkata is around 30°C with cloudy or foggy conditions 🌫.
```

### Execute Command

```
Please enter your query: Create a todo list folder and in that folder create a todo list using html css and js
🧠: The user wants to create a todo list folder and add HTML, CSS, and JS files for a todo list app.
🧠: I will use the executeCommand tool to create the folder and files.
🔧: Tool call executeCommand : (mkdir todo-list && cd todo-list && touch index.html style.css app.js)
🧠: The output of executeCommand tool is (no output if successful)
🤖: Created a folder named 'todo-list' with index.html, style.css, and app.js files inside.
```