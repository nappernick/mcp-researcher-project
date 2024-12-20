# MCP Research Assistant Project

This repository contains a modular and extensible setup for a Model Context Protocol (MCP) Research Assistant system. It integrates multiple services and components, including:

- A TypeScript-based server implementing the MCP standard.
- A "wrapper" module (`mcp-wrapper`) that provides a common interface to various Large Language Model (LLM) providers such as OpenAI and Anthropic.
- An NLP module that provides entity extraction, summarization, and other natural language processing functionalities via RabbitMQ and optional third-party models.
- A Neo4j-based Knowledge Graph (KG) manager for storing entities and relations discovered by the system.
- A frontend built using Backroad to provide a UI interface to the MCP system.
- A shared library of types, schemas, and validation logic ensuring a consistent and reliable interface.

## Table of Contents

- [Introduction](#introduction)
- [Key Components](#key-components)
  - [MCP Protocol Support](#mcp-protocol-support)
  - [mcp-wrapper](#mcp-wrapper)
  - [NLP Module](#nlp-module)
  - [Knowledge Graph Management](#knowledge-graph-management)
  - [Frontend (Backroad)](#frontend-backroad)
  - [Shared Module](#shared-module)
- [Installation and Setup](#installation-and-setup)
- [Configuration](#configuration)
- [Running the MCP System](#running-the-mcp-system)
- [Technical Details](#technical-details)
  - [MCP Schema Validation](#mcp-schema-validation)
  - [Provider Abstraction](#provider-abstraction)
  - [NLP Processing Workflows](#nlp-processing-workflows)
  - [Knowledge Graph Integration](#knowledge-graph-integration)
- [Development and Testing](#development-and-testing)
- [Directory Structure](#directory-structure)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Model Context Protocol (MCP) aims to provide a standardized interaction model between clients and language model-powered servers. This project showcases a research assistant that uses MCP, integrating search, entity extraction, and other NLP tasks. The system can:

- Accept queries from users (text prompts).
- Perform searches using external knowledge sources.
- Extract entities and relations to build a Knowledge Graph.
- Summarize and translate text.
- Use a wrapper to switch between model providers like OpenAI and Anthropic without changing the core logic.

The overall goal is to demonstrate a flexible, modular architecture where each component (MCP server, LLM provider, NLP module, Knowledge Graph) can be swapped or extended as needed.

## Key Components

### MCP Protocol Support

We implement MCP endpoints such as `initialize`, `prompts/list`, `tools/list`, `search_and_store`, and more. The `shared` folder contains the schemas for all these requests and responses, ensuring strict validation and consistency.

### mcp-wrapper

The `mcp-wrapper` directory provides a uniform interface to different LLM providers (e.g., OpenAI, Anthropic). It abstracts away provider-specific details:

- `OpenAIProvider`: For interaction with OpenAI models.
- `ClaudeProvider`: For interaction with Anthropic’s Claude models.

This wrapper uses JSON schemas and careful validation. The `ProviderFactory` selects the provider based on environment configuration.

### NLP Module

The `nlp-module` directory (particularly `py_api`) demonstrates how to integrate Python-based NLP logic. It includes:

- Entity extraction and relation detection using a prompt-based model approach.
- Summarization tasks.
- Graph improvement logic.
- Token counting utilities.

These tasks are exposed as tools, callable from the MCP server. The NLP services communicate via RabbitMQ queues, enabling asynchronous and scalable processing.

### Knowledge Graph Management

A `KnowledgeGraphManager` backed by Neo4j handles entities and relations. After extracting entities and relations, they can be persisted, queried, and improved over time. This integration shows how to maintain structured knowledge derived from unstructured text queries.

### Frontend (Backroad)

A minimal `mcp_frontend` application using [Backroad](https://backroad.sudomakes.art/) provides a GUI. Users can interact, submit queries, and see responses. The frontend showcases a chat-like interface to the MCP Research Assistant.

### Shared Module

The `shared` directory contains common schemas, types, and utility code:

- JSON schemas for all MCP requests and responses.
- Type definitions for requests, responses, tools, and entities.
- Validation utilities using Ajv.
- Common error handling and logging interfaces.

By centralizing these definitions, the entire system remains consistent and easier to maintain.

## Installation and Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourname/mcp-research-assistant.git
   cd mcp-research-assistant
   ```

2. **Install Dependencies**:
   Most code uses `bun`, `npm`, or `yarn`. Ensure you have `bun` installed (https://bun.sh/).
   ```bash
   bun install
   ```
   
   Similarly, install Python dependencies for `nlp-module` (see `requirements.txt`):
   ```bash
   cd nlp-module/py_api
   pip install -r requirements.txt
   ```

3. **Environment Variables**:
   Set environment variables needed by the system:
   - `OPENAI_API_KEY`, `CLAUDE_API_KEY` for LLM providers.
   - `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD` for Neo4j.
   - `MONGO_URI` for MongoDB.
   - `RABBITMQ_HOST`, `RABBITMQ_USERNAME`, `RABBITMQ_PASSWORD` for RabbitMQ.

   Create a `.env` file in the root directory if desired.

4. **Configure Providers**:
   Set `PROVIDER_NAME=openai` or `PROVIDER_NAME=anthropic` depending on which provider you want to use. This will determine which provider the `mcp-wrapper` uses.

## Configuration

The code uses `.env` files for configuration. The `ConfigLoader` and `loadConfig()` functions load these variables at runtime. MCP server configuration resides in `config.ts` in the `mcp-research-assistant` directory, and similar patterns are followed in other modules.

## Running the MCP System

1. **Start the MCP Research Assistant** (TypeScript-based):
   ```bash
   cd mcp/mcp-research-assistant
   bun run start
   ```
   This will start the main MCP server.

2. **Start NLP Module** (Python-based):
   ```bash
   cd mcp/nlp-module/py_api
   python server.py
   ```
   This starts the NLP MCP server for entity extraction, summarization, etc.

3. **Start the Frontend**:
   ```bash
   cd mcp/mcp_frontend
   bun run main.ts
   ```
   Then open `http://localhost:3000` (or the port configured) in your browser.

4. **Interacting with the System**:
   Use the frontend to type queries and see responses. The system will handle the request, possibly calling tools (NLP, search, etc.), and return structured responses.

## Technical Details

### MCP Schema Validation

All requests and responses are validated against JSON schemas. The `shared` directory contains `schemas/` that define the shape of each MCP message. This ensures clients and servers adhere to the MCP specification.

### Provider Abstraction

`mcp-wrapper` allows switching from OpenAI to Anthropic providers without changing application logic. `ProviderFactory` reads `PROVIDER_NAME` from environment variables and returns the correct provider implementation.

### NLP Processing Workflows

NLP tasks like summarization or entity extraction use RabbitMQ for asynchronous, fault-tolerant processing. The request is sent to a queue, a worker processes it (e.g., calling a model), and returns the result. This design allows scaling NLP workloads independently.

### Knowledge Graph Integration

The `KnowledgeGraphManager` writes entities and relations to Neo4j. Extracted entities and relations from NLP tasks are persisted, enabling complex downstream tasks like reasoning over knowledge, improving graph quality, or integrating additional data sources.

## Development and Testing

- **Unit Tests**:
  Run Jest tests for the TypeScript code:
  ```bash
  cd mcp/mcp-research-assistant
  bun run test
  ```
  
  Similarly, Python tests can be run for the NLP module (if included).

- **Linting and Formatting**:
  Use ESLint and Prettier to maintain code quality.

- **Local End-to-End Testing**:
  Start all services locally (MCP servers, NLP module, frontend, RabbitMQ, Neo4j, MongoDB) and test queries through the frontend or cURL.

## Directory Structure

```
mcp/
  ├─ mcp-research-assistant/         # The main MCP server (TypeScript, Bun)
  │   ├─ src/                        # Source code for handlers, tools, etc.
  │   ├─ tests/                      # Jest tests
  │   ├─ package.json
  │   └─ ...
  ├─ mcp-wrapper/                    # MCP wrapper for LLM providers
  │   ├─ src/providers/              # OpenAI, Claude providers
  │   ├─ src/mcp/                    # MCP client/server logic
  │   ├─ tests/                      # Provider tests
  │   ├─ package.json
  │   └─ ...
  ├─ shared/                         # Common schemas, types, utilities
  │   ├─ schemas/                    # JSON schemas
  │   ├─ types/                      # Type definitions
  │   ├─ utils/                      # Validation, error handling
  │   ├─ tests/                      # Shared module tests
  │   └─ package.json
  ├─ nlp-module/py_api/              # NLP service (Python)
  │   ├─ tools/                      # NLP tools: extract, summarize, etc.
  │   ├─ utils/                      # logger, json parsing
  │   ├─ requirements.txt
  │   └─ server.py
  ├─ mcp_frontend/                   # Frontend using Backroad
  │   ├─ src/                        # UI components, pages
  │   ├─ index.ts                    # Entry point
  │   └─ package.json
  ├─ ts_api/                         # Additional TS APIs and utilities
  │   └─ ...                        
  └─ ...
```

## Contributing

Contributions are welcome! Before submitting a PR:

1. Open an issue or discussion to propose changes.
2. Follow coding conventions and ensure all tests pass.
3. Add appropriate schema validations if adding new MCP endpoints.

## License

This work is provided under the MIT License. See `LICENSE` for details.