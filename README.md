# Astra Agent NextJS

This demo is a simple Astra AI Agent built with NextJS, Astra and OpenAI.

It is built over the standard Cassio Python data model, but I created a simple CassioJS here.

![Screenshot](docs/nextjs-astra.png)

The form on the main page invokes the API, built at app/api/chat.

The API generates the embedding, searches for similar contents from the database, and creates the prompt, then returns the answer to the application.

## How to run

- Git Clone
- Adjust you environment variables (copy _env_sample to .env)
- npm install
- npm run dev