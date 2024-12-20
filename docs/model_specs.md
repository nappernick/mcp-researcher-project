
Specification

Architecture
Architecture
The Model Context Protocol (MCP) follows a client-host-server architecture where each host can run multiple client instances. This architecture enables users to integrate AI capabilities across applications while maintaining clear security boundaries and isolating concerns. Built on JSON-RPC, MCP provides a stateful session protocol focused on context exchange and sampling coordination between clients and servers.
Core Components

 
Internet
Local machine
Application Host Process









Server 3
External APIs
Remote
Resource C
Server 1
Files & Git
Server 2
Database
Local
Resource A
Local
Resource B
Host
Client 1
Client 2
Client 3
Host

 
The host process acts as the container and coordinator:
	•	Creates and manages multiple client instances
	•	Controls client connection permissions and lifecycle
	•	Enforces security policies and consent requirements
	•	Handles user authorization decisions
	•	Coordinates AI/LLM integration and sampling
	•	Manages context aggregation across clients
Clients

 
Each client is created by the host and maintains an isolated server connection:
	•	Establishes one stateful session per server
	•	Handles protocol negotiation and capability exchange
	•	Routes protocol messages bidirectionally
	•	Manages subscriptions and notifications
	•	Maintains security boundaries between servers
A host application creates and manages multiple clients, with each client having a 1:1 relationship with a particular server.
Servers

 
Servers provide specialized context and capabilities:
	•	Expose resources, tools and prompts via MCP primitives
	•	Operate independently with focused responsibilities
	•	Request sampling through client interfaces
	•	Must respect security constraints
	•	Can be local processes or remote services
Design Principles

 
MCP is built on several key design principles that inform its architecture and implementation:
	1	Servers should be extremely easy to build
	•	Host applications handle complex orchestration responsibilities
	•	Servers focus on specific, well-defined capabilities
	•	Simple interfaces minimize implementation overhead
	•	Clear separation enables maintainable code
	2	Servers should be highly composable
	•	Each server provides focused functionality in isolation
	•	Multiple servers can be combined seamlessly
	•	Shared protocol enables interoperability
	•	Modular design supports extensibility
	3	Servers should not be able to read the whole conversation, nor “see into” other servers
	•	Servers receive only necessary contextual information
	•	Full conversation history stays with the host
	•	Each server connection maintains isolation
	•	Cross-server interactions are controlled by the host
	•	Host process enforces security boundaries
	4	Features can be added to servers and clients progressively
	•	Core protocol provides minimal required functionality
	•	Additional capabilities can be negotiated as needed
	•	Servers and clients evolve independently
	•	Protocol designed for future extensibility
	•	Backwards compatibility is maintained
Message Types

 
MCP defines three core message types based on JSON-RPC 2.0:
	•	Requests: Bidirectional messages with method and parameters expecting a response
	•	Responses: Successful results or errors matching specific request IDs
	•	Notifications: One-way messages requiring no response
Each message type follows the JSON-RPC 2.0 specification for structure and delivery semantics.
Capability Negotiation

 
The Model Context Protocol uses a capability-based negotiation system where clients and servers explicitly declare their supported features during initialization. Capabilities determine which protocol features and primitives are available during a session.
	•	Servers declare capabilities like resource subscriptions, tool support, and prompt templates
	•	Clients declare capabilities like sampling support and notification handling
	•	Both parties must respect declared capabilities throughout the session
	•	Additional capabilities can be negotiated through extensions to the protocol
Server
Client
Host
Server
Client
Host
Active Session with Negotiated Features
loop
[Client Requests]
loop
[Server Requests]
loop
[Notifications]
Initialize client
Initialize session with capabilities
Respond with supported capabilities
User- or model-initiated action
Request (tools/resources)
Response
Update UI or respond to model
Request (sampling)
Forward to AI
AI response
Response
Resource updates
Status changes
Terminate
End session
Each capability unlocks specific protocol features for use during the session. For example:
	•	Implemented server features must be advertised in the server’s capabilities
	•	Emitting resource subscription notifications requires the server to declare subscription support
	•	Tool invocation requires the server to declare tool capabilities
	•	Sampling requires the client to declare support in its capabilities
This capability negotiation ensures clients and servers have a clear understanding of supported functionality while maintaining protocol extensibility.



Specification

Base Protocol

Messages
Messages
ℹ️
Protocol Revision: 2024-11-05
All messages in MCP MUST follow the JSON-RPC 2.0 specification. The protocol defines three types of messages:
Requests

 
Requests are sent from the client to the server or vice versa.
{
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: {
    [key: string]: unknown;
  };
}

	•	Requests MUST include a string or integer ID.
	•	Unlike base JSON-RPC, the ID MUST NOT be null.
	•	The request ID MUST NOT have been previously used by the requestor within the same session.
Responses

 
Responses are sent in reply to requests.
{
  jsonrpc: "2.0";
  id: string | number;
  result?: {
    [key: string]: unknown;
  }
  error?: {
    code: number;
    message: string;
    data?: unknown;
  }
}

	•	Responses MUST include the same ID as the request they correspond to.
	•	Either a result or an error MUST be set. A response MUST NOT set both.
	•	Error codes MUST be integers.
Notifications

 
Notifications are sent from the client to the server or vice versa. They do not expect a response.
{
  jsonrpc: "2.0";
  method: string;
  params?: {
    [key: string]: unknown;
  };
}

	•	Notifications MUST NOT include an ID.
Specification

Base Protocol

Lifecycle
Lifecycle
ℹ️
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) defines a rigorous lifecycle for client-server connections that ensures proper capability negotiation and state management.
	1	Initialization: Capability negotiation and protocol version agreement
	2	Operation: Normal protocol communication
	3	Shutdown: Graceful termination of the connection
Server
Client
Server
Client
Initialization Phase
Operation Phase
Normal protocol operations
Shutdown
Connection closed
initialize request
initialize response
initialized notification
Disconnect
Lifecycle Phases

 
Initialization

 
The initialization phase MUST be the first interaction between client and server. During this phase, the client and server:
	•	Establish protocol version compatibility
	•	Exchange and negotiate capabilities
	•	Share implementation details
The client MUST initiate this phase by sending an initialize request containing:
	•	Protocol version supported
	•	Client capabilities
	•	Client implementation information
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": {
        "listChanged": true
      },
      "sampling": {}
    },
    "clientInfo": {
      "name": "ExampleClient",
      "version": "1.0.0"
    }
  }
}

The server MUST respond with its own capabilities and information:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "logging": {},
      "prompts": {
        "listChanged": true
      },
      "resources": {
        "subscribe": true,
        "listChanged": true
      },
      "tools": {
        "listChanged": true
      }
    },
    "serverInfo": {
      "name": "ExampleServer",
      "version": "1.0.0"
    }
  }
}

After successful initialization, the client MUST send an initialized notification to indicate it is ready to begin normal operations:
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}

	•	The client SHOULD NOT send requests other than pings before the server has responded to the initialize request.
	•	The server SHOULD NOT send requests other than pings and logging before receiving the initialized notification.
Version Negotiation

 
In the initialize request, the client MUST send a protocol version it supports. This SHOULD be the latest version supported by the client.
If the server supports the requested protocol version, it MUST respond with the same version. Otherwise, the server MUST respond with another protocol version it supports. This SHOULD be the latest version supported by the server.
If the client does not support the version in the server’s response, it SHOULD disconnect.
Capability Negotiation

 
Client and server capabilities establish which optional protocol features will be available during the session.
Key capabilities include:
Category
Capability
Description
Client
roots
Ability to provide filesystem roots
Client
sampling
Support for LLM sampling requests
Client
experimental
Describes support for non-standard experimental features
Server
prompts
Offers prompt templates
Server
resources
Provides readable resources
Server
tools
Exposes callable tools
Server
logging
Emits structured log messages
Server
experimental
Describes support for non-standard experimental features
Capability objects can describe sub-capabilities like:
	•	listChanged: Support for list change notifications (for prompts, resources, and tools)
	•	subscribe: Support for subscribing to individual items’ changes (resources only)
Operation

 
During the operation phase, the client and server exchange messages according to the negotiated capabilities.
Both parties SHOULD:
	•	Respect the negotiated protocol version
	•	Only use capabilities that were successfully negotiated
Shutdown

 
During the shutdown phase, one side (usually the client) cleanly terminates the protocol connection. No specific shutdown messages are defined—instead, the underlying transport mechanism should be used to signal connection termination:
stdio

 
For the stdio transport, the client SHOULD initiate shutdown by:
	1	First, closing the input stream to the child process (the server)
	2	Waiting for the server to exit, or sending SIGTERM if the server does not exit within a reasonable time
	3	Sending SIGKILL if the server does not exit within a reasonable time after SIGTERM
The server MAY initiate shutdown by closing its output stream to the client and exiting.
HTTP

 
For HTTP transports, shutdown is indicated by closing the associated HTTP connection(s).
Error Handling

 
Implementations SHOULD be prepared to handle these error cases:
	•	Protocol version mismatch
	•	Failure to negotiate required capabilities
	•	Initialize request timeout
	•	Shutdown timeout
Implementations SHOULD implement appropriate timeouts for all requests, to prevent hung connections and resource exhaustion.
Example initialization error:
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Unsupported protocol version",
    "data": {
      "supported": ["2024-11-05"],
      "requested": "1.0.0"
    }
  }
}



Specification

Base Protocol

Transports
Transports
ℹ️
Protocol Revision: 2024-11-05
MCP currently defines two standard transport mechanisms for client-server communication:
	1	stdio, communication over standard in and standard out
	2	HTTP with Server-Sent Events (SSE)
Clients SHOULD support stdio whenever possible.
It is also possible for clients and servers to implement custom transports in a pluggable fashion.
stdio

 
In the stdio transport:
	•	The client launches the MCP server as a subprocess.
	•	The server receives JSON-RPC messages on its standard input (stdin) and writes responses to its standard output (stdout).
	•	Messages are delimited by newlines, and MUST NOT contain embedded newlines.
	•	The server MAY write UTF-8 strings to its standard error (stderr) for logging purposes. Clients MAY capture, forward, or ignore this logging.
	•	The server MUST NOT write anything to its stdout that is not a valid MCP message.
	•	The client MUST NOT write anything to the server’s stdin that is not a valid MCP message.
Server Process
Client
Server Process
Client
loop
[Message Exchange]
Launch subprocess
Write to stdin
Write to stdout
Optional logs on stderr
Close stdin, terminate subprocess
HTTP with SSE

 
In the SSE transport, the server operates as an independent process that can handle multiple client connections.
The server MUST provide two endpoints:
	1	An SSE endpoint, for clients to establish a connection and receive messages from the server
	2	A regular HTTP POST endpoint for clients to send messages to the server
When a client connects, the server MUST send an endpoint event containing a URI for the client to use for sending messages. All subsequent client messages MUST be sent as HTTP POST requests to this endpoint.
Server messages are sent as SSE message events, with the message content encoded as JSON in the event data.
Server
Client
Server
Client
loop
[Message Exchange]
Open SSE connection
endpoint event
HTTP POST messages
SSE message events
Close SSE connection
Custom Transports

 
Clients and servers MAY implement additional custom transport mechanisms to suit their specific needs. The protocol is transport-agnostic and can be implemented over any communication channel that supports bidirectional message exchange.
Implementers who choose to support custom transports MUST ensure they preserve the JSON-RPC message format and lifecycle requirements defined by MCP. Custom transports SHOULD document their specific connection establishment and message exchange patterns to aid interoperability.



Versioning
The Model Context Protocol uses string-based version identifiers following the format YYYY-MM-DD, to indicate the last date backwards incompatible changes were made.
The current protocol version is 2024-11-05. See all revisions.
ℹ️
The protocol version will not be incremented when the protocol is updated, as long as the changes maintain backwards compatibility. This allows for incremental improvements while preserving interoperability.
Version negotiation happens during initialization. Clients and servers MAY support multiple protocol versions simultaneously, but they MUST agree on a single version to use for the session.
The protocol provides appropriate error handling if version negotiation fails, allowing clients to gracefully terminate connections when they cannot find a version compatible with the server.



Ping
ℹ️
Protocol Revision: 2024-11-05
The Model Context Protocol includes an optional ping mechanism that allows either party to verify that their counterpart is still responsive and the connection is alive.
Overview

 
The ping functionality is implemented through a simple request/response pattern. Either the client or server can initiate a ping by sending a ping request.
Message Format

 
A ping request is a standard JSON-RPC request with no parameters:
{
  "jsonrpc": "2.0",
  "id": "123",
  "method": "ping"
}

Behavior Requirements

 
	1	The receiver MUST respond promptly with an empty response:
{
  "jsonrpc": "2.0",
  "id": "123",
  "result": {}
}

	2	If no response is received within a reasonable timeout period, the sender MAY:
	•	Consider the connection stale
	•	Terminate the connection
	•	Attempt reconnection procedures
Usage Patterns

 
Receiver
Sender
Receiver
Sender
ping request
empty response
Implementation Considerations

 
	•	Implementations SHOULD periodically issue pings to detect connection health
	•	The frequency of pings SHOULD be configurable
	•	Timeouts SHOULD be appropriate for the network environment
	•	Excessive pinging SHOULD be avoided to reduce network overhead
Error Handling

 
	•	Timeouts SHOULD be treated as connection failures
	•	Multiple failed pings MAY trigger connection reset
	•	Implementations SHOULD log ping failures for diagnostics



Cancellation
ℹ️
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) supports optional cancellation of in-progress requests through notification messages. Either side can send a cancellation notification to indicate that a previously-issued request should be terminated.
Cancellation Flow

 
When a party wants to cancel an in-progress request, it sends a notifications/cancelled notification containing:
	•	The ID of the request to cancel
	•	An optional reason string that can be logged or displayed
{
  "jsonrpc": "2.0",
  "method": "notifications/cancelled",
  "params": {
    "requestId": "123",
    "reason": "User requested cancellation"
  }
}

Behavior Requirements

 
	1	Cancellation notifications MUST only reference requests that:
	•	Were previously issued in the same direction
	•	Are believed to still be in-progress
	2	The initialize request MUST NOT be cancelled by clients
	3	Receivers of cancellation notifications SHOULD:
	•	Stop processing the cancelled request
	•	Free associated resources
	•	Not send a response for the cancelled request
	4	Receivers MAY ignore cancellation notifications if:
	•	The referenced request is unknown
	•	Processing has already completed
	•	The request cannot be cancelled
	5	The sender of the cancellation notification SHOULD ignore any response to the request that arrives afterward
Timing Considerations

 
Due to network latency, cancellation notifications may arrive after request processing has completed, and potentially after a response has already been sent.
Both parties MUST handle these race conditions gracefully:
Server
Client
Server
Client
Processing starts
Processing may have
completed before
cancellation arrives
Stop processing
alt

[If not
completed]
Request (ID: 123)
notifications/cancelled (ID: 123)
Implementation Notes

 
	•	Both parties SHOULD log cancellation reasons for debugging
	•	Application UIs SHOULD indicate when cancellation is requested
Error Handling

 
Invalid cancellation notifications SHOULD be ignored:
	•	Unknown request IDs
	•	Already completed requests
	•	Malformed notifications
This maintains the “fire and forget” nature of notifications while allowing for race conditions in asynchronous communication.


Specification

Base Protocol

Utilities

Progress
Progress
ℹ️
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) supports optional progress tracking for long-running operations through notification messages. Either side can send progress notifications to provide updates about operation status.
Progress Flow

 
When a party wants to receive progress updates for a request, it includes a progressToken in the request metadata.
	•	Progress tokens MUST be a string or integer value
	•	Progress tokens can be chosen by the sender using any means, but MUST be unique across all active requests.
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "some_method",
  "params": {
    "_meta": {
      "progressToken": "abc123"
    }
  }
}

The receiver MAY then send progress notifications containing:
	•	The original progress token
	•	The current progress value so far
	•	An optional “total” value
{
  "jsonrpc": "2.0",
  "method": "notifications/progress",
  "params": {
    "progressToken": "abc123",
    "progress": 50,
    "total": 100
  }
}

	•	The progress value MUST increase with each notification, even if the total is unknown.
	•	The progress and the total values MAY be floating point.
Behavior Requirements

 
	1	Progress notifications MUST only reference tokens that:
	•	Were provided in an active request
	•	Are associated with an in-progress operation
	2	Receivers of progress requests MAY:
	•	Choose not to send any progress notifications
	•	Send notifications at whatever frequency they deem appropriate
	•	Omit the total value if unknown
Receiver
Sender
Receiver
Sender
Request with progress token
Progress updates
loop
[Progress Updates]
Operation complete
Method request with progressToken
Progress notification (0.2/1.0)
Progress notification (0.6/1.0)
Progress notification (1.0/1.0)
Method response
Implementation Notes

 
	•	Senders and receivers SHOULD track active progress tokens
	•	Both parties SHOULD implement rate limiting to prevent flooding
	•	Progress notifications MUST stop after completion


/* JSON-RPC types */
export type JSONRPCMessage =
  | JSONRPCRequest
  | JSONRPCNotification
  | JSONRPCResponse
  | JSONRPCError;

export const LATEST_PROTOCOL_VERSION = "2024-11-05";
export const JSONRPC_VERSION = "2.0";

/**
 * A progress token, used to associate progress notifications with the original request.
 */
export type ProgressToken = string | number;

/**
 * An opaque token used to represent a cursor for pagination.
 */
export type Cursor = string;

export interface Request {
  method: string;
  params?: {
    _meta?: {
      /**
       * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
       */
      progressToken?: ProgressToken;
    };
    [key: string]: unknown;
  };
}

export interface Notification {
  method: string;
  params?: {
    /**
     * This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.
     */
    _meta?: { [key: string]: unknown };
    [key: string]: unknown;
  };
}

export interface Result {
  /**
   * This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.
   */
  _meta?: { [key: string]: unknown };
  [key: string]: unknown;
}

/**
 * A uniquely identifying ID for a request in JSON-RPC.
 */
export type RequestId = string | number;

/**
 * A request that expects a response.
 */
export interface JSONRPCRequest extends Request {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
}

/**
 * A notification which does not expect a response.
 */
export interface JSONRPCNotification extends Notification {
  jsonrpc: typeof JSONRPC_VERSION;
}

/**
 * A successful (non-error) response to a request.
 */
export interface JSONRPCResponse {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
  result: Result;
}

// Standard JSON-RPC error codes
export const PARSE_ERROR = -32700;
export const INVALID_REQUEST = -32600;
export const METHOD_NOT_FOUND = -32601;
export const INVALID_PARAMS = -32602;
export const INTERNAL_ERROR = -32603;

/**
 * A response to a request that indicates an error occurred.
 */
export interface JSONRPCError {
  jsonrpc: typeof JSONRPC_VERSION;
  id: RequestId;
  error: {
    /**
     * The error type that occurred.
     */
    code: number;
    /**
     * A short description of the error. The message SHOULD be limited to a concise single sentence.
     */
    message: string;
    /**
     * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
     */
    data?: unknown;
  };
}

/* Empty result */
/**
 * A response that indicates success but carries no data.
 */
export type EmptyResult = Result;

/* Cancellation */
/**
 * This notification can be sent by either side to indicate that it is cancelling a previously-issued request.
 *
 * The request SHOULD still be in-flight, but due to communication latency, it is always possible that this notification MAY arrive after the request has already finished.
 *
 * This notification indicates that the result will be unused, so any associated processing SHOULD cease.
 *
 * A client MUST NOT attempt to cancel its `initialize` request.
 */
export interface CancelledNotification extends Notification {
  method: "notifications/cancelled";
  params: {
    /**
     * The ID of the request to cancel.
     *
     * This MUST correspond to the ID of a request previously issued in the same direction.
     */
    requestId: RequestId;

    /**
     * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
     */
    reason?: string;
  };
}

/* Initialization */
/**
 * This request is sent from the client to the server when it first connects, asking it to begin initialization.
 */
export interface InitializeRequest extends Request {
  method: "initialize";
  params: {
    /**
     * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
     */
    protocolVersion: string;
    capabilities: ClientCapabilities;
    clientInfo: Implementation;
  };
}

/**
 * After receiving an initialize request from the client, the server sends this response.
 */
export interface InitializeResult extends Result {
  /**
   * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
   */
  protocolVersion: string;
  capabilities: ServerCapabilities;
  serverInfo: Implementation;
  /**
   * Instructions describing how to use the server and its features.
   *
   * This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a "hint" to the model. For example, this information MAY be added to the system prompt.
   */
  instructions?: string;
}

/**
 * This notification is sent from the client to the server after initialization has finished.
 */
export interface InitializedNotification extends Notification {
  method: "notifications/initialized";
}

/**
 * Capabilities a client may support. Known capabilities are defined here, in this schema, but this is not a closed set: any client can define its own, additional capabilities.
 */
export interface ClientCapabilities {
  /**
   * Experimental, non-standard capabilities that the client supports.
   */
  experimental?: { [key: string]: object };
  /**
   * Present if the client supports listing roots.
   */
  roots?: {
    /**
     * Whether the client supports notifications for changes to the roots list.
     */
    listChanged?: boolean;
  };
  /**
   * Present if the client supports sampling from an LLM.
   */
  sampling?: object;
}

/**
 * Capabilities that a server may support. Known capabilities are defined here, in this schema, but this is not a closed set: any server can define its own, additional capabilities.
 */
export interface ServerCapabilities {
  /**
   * Experimental, non-standard capabilities that the server supports.
   */
  experimental?: { [key: string]: object };
  /**
   * Present if the server supports sending log messages to the client.
   */
  logging?: object;
  /**
   * Present if the server offers any prompt templates.
   */
  prompts?: {
    /**
     * Whether this server supports notifications for changes to the prompt list.
     */
    listChanged?: boolean;
  };
  /**
   * Present if the server offers any resources to read.
   */
  resources?: {
    /**
     * Whether this server supports subscribing to resource updates.
     */
    subscribe?: boolean;
    /**
     * Whether this server supports notifications for changes to the resource list.
     */
    listChanged?: boolean;
  };
  /**
   * Present if the server offers any tools to call.
   */
  tools?: {
    /**
     * Whether this server supports notifications for changes to the tool list.
     */
    listChanged?: boolean;
  };
}

/**
 * Describes the name and version of an MCP implementation.
 */
export interface Implementation {
  name: string;
  version: string;
}

/* Ping */
/**
 * A ping, issued by either the server or the client, to check that the other party is still alive. The receiver must promptly respond, or else may be disconnected.
 */
export interface PingRequest extends Request {
  method: "ping";
}

/* Progress notifications */
/**
 * An out-of-band notification used to inform the receiver of a progress update for a long-running request.
 */
export interface ProgressNotification extends Notification {
  method: "notifications/progress";
  params: {
    /**
     * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
     */
    progressToken: ProgressToken;
    /**
     * The progress thus far. This should increase every time progress is made, even if the total is unknown.
     *
     * @TJS-type number
     */
    progress: number;
    /**
     * Total number of items to process (or total progress required), if known.
     *
     * @TJS-type number
     */
    total?: number;
  };
}

/* Pagination */
export interface PaginatedRequest extends Request {
  params?: {
    /**
     * An opaque token representing the current pagination position.
     * If provided, the server should return results starting after this cursor.
     */
    cursor?: Cursor;
  };
}

export interface PaginatedResult extends Result {
  /**
   * An opaque token representing the pagination position after the last returned result.
   * If present, there may be more results available.
   */
  nextCursor?: Cursor;
}

/* Resources */
/**
 * Sent from the client to request a list of resources the server has.
 */
export interface ListResourcesRequest extends PaginatedRequest {
  method: "resources/list";
}

/**
 * The server's response to a resources/list request from the client.
 */
export interface ListResourcesResult extends PaginatedResult {
  resources: Resource[];
}

/**
 * Sent from the client to request a list of resource templates the server has.
 */
export interface ListResourceTemplatesRequest extends PaginatedRequest {
  method: "resources/templates/list";
}

/**
 * The server's response to a resources/templates/list request from the client.
 */
export interface ListResourceTemplatesResult extends PaginatedResult {
  resourceTemplates: ResourceTemplate[];
}

/**
 * Sent from the client to the server, to read a specific resource URI.
 */
export interface ReadResourceRequest extends Request {
  method: "resources/read";
  params: {
    /**
     * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
     *
     * @format uri
     */
    uri: string;
  };
}

/**
 * The server's response to a resources/read request from the client.
 */
export interface ReadResourceResult extends Result {
  contents: (TextResourceContents | BlobResourceContents)[];
}

/**
 * An optional notification from the server to the client, informing it that the list of resources it can read from has changed. This may be issued by servers without any previous subscription from the client.
 */
export interface ResourceListChangedNotification extends Notification {
  method: "notifications/resources/list_changed";
}

/**
 * Sent from the client to request resources/updated notifications from the server whenever a particular resource changes.
 */
export interface SubscribeRequest extends Request {
  method: "resources/subscribe";
  params: {
    /**
     * The URI of the resource to subscribe to. The URI can use any protocol; it is up to the server how to interpret it.
     *
     * @format uri
     */
    uri: string;
  };
}

/**
 * Sent from the client to request cancellation of resources/updated notifications from the server. This should follow a previous resources/subscribe request.
 */
export interface UnsubscribeRequest extends Request {
  method: "resources/unsubscribe";
  params: {
    /**
     * The URI of the resource to unsubscribe from.
     *
     * @format uri
     */
    uri: string;
  };
}

/**
 * A notification from the server to the client, informing it that a resource has changed and may need to be read again. This should only be sent if the client previously sent a resources/subscribe request.
 */
export interface ResourceUpdatedNotification extends Notification {
  method: "notifications/resources/updated";
  params: {
    /**
     * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
     *
     * @format uri
     */
    uri: string;
  };
}

/**
 * A known resource that the server is capable of reading.
 */
export interface Resource extends Annotated {
  /**
   * The URI of this resource.
   *
   * @format uri
   */
  uri: string;

  /**
   * A human-readable name for this resource.
   *
   * This can be used by clients to populate UI elements.
   */
  name: string;

  /**
   * A description of what this resource represents.
   *
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description?: string;

  /**
   * The MIME type of this resource, if known.
   */
  mimeType?: string;
}

/**
 * A template description for resources available on the server.
 */
export interface ResourceTemplate extends Annotated {
  /**
   * A URI template (according to RFC 6570) that can be used to construct resource URIs.
   *
   * @format uri-template
   */
  uriTemplate: string;

  /**
   * A human-readable name for the type of resource this template refers to.
   *
   * This can be used by clients to populate UI elements.
   */
  name: string;

  /**
   * A description of what this template is for.
   *
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description?: string;

  /**
   * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
   */
  mimeType?: string;
}

/**
 * The contents of a specific resource or sub-resource.
 */
export interface ResourceContents {
  /**
   * The URI of this resource.
   *
   * @format uri
   */
  uri: string;
  /**
   * The MIME type of this resource, if known.
   */
  mimeType?: string;
}

export interface TextResourceContents extends ResourceContents {
  /**
   * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
   */
  text: string;
}

export interface BlobResourceContents extends ResourceContents {
  /**
   * A base64-encoded string representing the binary data of the item.
   *
   * @format byte
   */
  blob: string;
}

/* Prompts */
/**
 * Sent from the client to request a list of prompts and prompt templates the server has.
 */
export interface ListPromptsRequest extends PaginatedRequest {
  method: "prompts/list";
}

/**
 * The server's response to a prompts/list request from the client.
 */
export interface ListPromptsResult extends PaginatedResult {
  prompts: Prompt[];
}

/**
 * Used by the client to get a prompt provided by the server.
 */
export interface GetPromptRequest extends Request {
  method: "prompts/get";
  params: {
    /**
     * The name of the prompt or prompt template.
     */
    name: string;
    /**
     * Arguments to use for templating the prompt.
     */
    arguments?: { [key: string]: string };
  };
}

/**
 * The server's response to a prompts/get request from the client.
 */
export interface GetPromptResult extends Result {
  /**
   * An optional description for the prompt.
   */
  description?: string;
  messages: PromptMessage[];
}

/**
 * A prompt or prompt template that the server offers.
 */
export interface Prompt {
  /**
   * The name of the prompt or prompt template.
   */
  name: string;
  /**
   * An optional description of what this prompt provides
   */
  description?: string;
  /**
   * A list of arguments to use for templating the prompt.
   */
  arguments?: PromptArgument[];
}

/**
 * Describes an argument that a prompt can accept.
 */
export interface PromptArgument {
  /**
   * The name of the argument.
   */
  name: string;
  /**
   * A human-readable description of the argument.
   */
  description?: string;
  /**
   * Whether this argument must be provided.
   */
  required?: boolean;
}

/**
 * The sender or recipient of messages and data in a conversation.
 */
export type Role = "user" | "assistant";

/**
 * Describes a message returned as part of a prompt.
 *
 * This is similar to `SamplingMessage`, but also supports the embedding of
 * resources from the MCP server.
 */
export interface PromptMessage {
  role: Role;
  content: TextContent | ImageContent | EmbeddedResource;
}

/**
 * The contents of a resource, embedded into a prompt or tool call result.
 *
 * It is up to the client how best to render embedded resources for the benefit
 * of the LLM and/or the user.
 */
export interface EmbeddedResource extends Annotated {
  type: "resource";
  resource: TextResourceContents | BlobResourceContents;
}

/**
 * An optional notification from the server to the client, informing it that the list of prompts it offers has changed. This may be issued by servers without any previous subscription from the client.
 */
export interface PromptListChangedNotification extends Notification {
  method: "notifications/prompts/list_changed";
}

/* Tools */
/**
 * Sent from the client to request a list of tools the server has.
 */
export interface ListToolsRequest extends PaginatedRequest {
  method: "tools/list";
}

/**
 * The server's response to a tools/list request from the client.
 */
export interface ListToolsResult extends PaginatedResult {
  tools: Tool[];
}

/**
 * The server's response to a tool call.
 *
 * Any errors that originate from the tool SHOULD be reported inside the result
 * object, with `isError` set to true, _not_ as an MCP protocol-level error
 * response. Otherwise, the LLM would not be able to see that an error occurred
 * and self-correct.
 *
 * However, any errors in _finding_ the tool, an error indicating that the
 * server does not support tool calls, or any other exceptional conditions,
 * should be reported as an MCP error response.
 */
export interface CallToolResult extends Result {
  content: (TextContent | ImageContent | EmbeddedResource)[];

  /**
   * Whether the tool call ended in an error.
   *
   * If not set, this is assumed to be false (the call was successful).
   */
  isError?: boolean;
}

/**
 * Used by the client to invoke a tool provided by the server.
 */
export interface CallToolRequest extends Request {
  method: "tools/call";
  params: {
    name: string;
    arguments?: { [key: string]: unknown };
  };
}

/**
 * An optional notification from the server to the client, informing it that the list of tools it offers has changed. This may be issued by servers without any previous subscription from the client.
 */
export interface ToolListChangedNotification extends Notification {
  method: "notifications/tools/list_changed";
}

/**
 * Definition for a tool the client can call.
 */
export interface Tool {
  /**
   * The name of the tool.
   */
  name: string;
  /**
   * A human-readable description of the tool.
   */
  description?: string;
  /**
   * A JSON Schema object defining the expected parameters for the tool.
   */
  inputSchema: {
    type: "object";
    properties?: { [key: string]: object };
    required?: string[];
  };
}

/* Logging */
/**
 * A request from the client to the server, to enable or adjust logging.
 */
export interface SetLevelRequest extends Request {
  method: "logging/setLevel";
  params: {
    /**
     * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
     */
    level: LoggingLevel;
  };
}

/**
 * Notification of a log message passed from server to client. If no logging/setLevel request has been sent from the client, the server MAY decide which messages to send automatically.
 */
export interface LoggingMessageNotification extends Notification {
  method: "notifications/message";
  params: {
    /**
     * The severity of this log message.
     */
    level: LoggingLevel;
    /**
     * An optional name of the logger issuing this message.
     */
    logger?: string;
    /**
     * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
     */
    data: unknown;
  };
}

/**
 * The severity of a log message.
 *
 * These map to syslog message severities, as specified in RFC-5424:
 * https://datatracker.ietf.org/doc/html/rfc5424#section-6.2.1
 */
export type LoggingLevel =
  | "debug"
  | "info"
  | "notice"
  | "warning"
  | "error"
  | "critical"
  | "alert"
  | "emergency";

/* Sampling */
/**
 * A request from the server to sample an LLM via the client. The client has full discretion over which model to select. The client should also inform the user before beginning sampling, to allow them to inspect the request (human in the loop) and decide whether to approve it.
 */
export interface CreateMessageRequest extends Request {
  method: "sampling/createMessage";
  params: {
    messages: SamplingMessage[];
    /**
     * The server's preferences for which model to select. The client MAY ignore these preferences.
     */
    modelPreferences?: ModelPreferences;
    /**
     * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
     */
    systemPrompt?: string;
    /**
     * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt. The client MAY ignore this request.
     */
    includeContext?: "none" | "thisServer" | "allServers";
    /**
     * @TJS-type number
     */
    temperature?: number;
    /**
     * The maximum number of tokens to sample, as requested by the server. The client MAY choose to sample fewer tokens than requested.
     */
    maxTokens: number;
    stopSequences?: string[];
    /**
     * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
     */
    metadata?: object;
  };
}

/**
 * The client's response to a sampling/create_message request from the server. The client should inform the user before returning the sampled message, to allow them to inspect the response (human in the loop) and decide whether to allow the server to see it.
 */
export interface CreateMessageResult extends Result, SamplingMessage {
  /**
   * The name of the model that generated the message.
   */
  model: string;
  /**
   * The reason why sampling stopped, if known.
   */
  stopReason?: "endTurn" | "stopSequence" | "maxTokens" | string;
}

/**
 * Describes a message issued to or received from an LLM API.
 */
export interface SamplingMessage {
  role: Role;
  content: TextContent | ImageContent;
}

/**
 * Base for objects that include optional annotations for the client. The client can use annotations to inform how objects are used or displayed
 */
export interface Annotated {
  annotations?: {
    /**
     * Describes who the intended customer of this object or data is.
     * 
     * It can include multiple entries to indicate content useful for multiple audiences (e.g., `["user", "assistant"]`).
     */
    audience?: Role[];

    /**
     * Describes how important this data is for operating the server.
     * 
     * A value of 1 means "most important," and indicates that the data is
     * effectively required, while 0 means "least important," and indicates that
     * the data is entirely optional.
     *
     * @TJS-type number
     * @minimum 0
     * @maximum 1
     */
    priority?: number;
  }
}

/**
 * Text provided to or from an LLM.
 */
export interface TextContent extends Annotated {
  type: "text";
  /**
   * The text content of the message.
   */
  text: string;
}

/**
 * An image provided to or from an LLM.
 */
export interface ImageContent extends Annotated {
  type: "image";
  /**
   * The base64-encoded image data.
   *
   * @format byte
   */
  data: string;
  /**
   * The MIME type of the image. Different providers may support different image types.
   */
  mimeType: string;
}

/**
 * The server's preferences for model selection, requested of the client during sampling.
 *
 * Because LLMs can vary along multiple dimensions, choosing the "best" model is
 * rarely straightforward.  Different models excel in different areas—some are
 * faster but less capable, others are more capable but more expensive, and so
 * on. This interface allows servers to express their priorities across multiple
 * dimensions to help clients make an appropriate selection for their use case.
 *
 * These preferences are always advisory. The client MAY ignore them. It is also
 * up to the client to decide how to interpret these preferences and how to
 * balance them against other considerations.
 */
export interface ModelPreferences {
  /**
   * Optional hints to use for model selection.
   *
   * If multiple hints are specified, the client MUST evaluate them in order
   * (such that the first match is taken).
   *
   * The client SHOULD prioritize these hints over the numeric priorities, but
   * MAY still use the priorities to select from ambiguous matches.
   */
  hints?: ModelHint[];

  /**
   * How much to prioritize cost when selecting a model. A value of 0 means cost
   * is not important, while a value of 1 means cost is the most important
   * factor.
   *
   * @TJS-type number
   * @minimum 0
   * @maximum 1
   */
  costPriority?: number;

  /**
   * How much to prioritize sampling speed (latency) when selecting a model. A
   * value of 0 means speed is not important, while a value of 1 means speed is
   * the most important factor.
   *
   * @TJS-type number
   * @minimum 0
   * @maximum 1
   */
  speedPriority?: number;

  /**
   * How much to prioritize intelligence and capabilities when selecting a
   * model. A value of 0 means intelligence is not important, while a value of 1
   * means intelligence is the most important factor.
   *
   * @TJS-type number
   * @minimum 0
   * @maximum 1
   */
  intelligencePriority?: number;
}

/**
 * Hints to use for model selection.
 *
 * Keys not declared here are currently left unspecified by the spec and are up
 * to the client to interpret.
 */
export interface ModelHint {
  /**
   * A hint for a model name.
   *
   * The client SHOULD treat this as a substring of a model name; for example:
   *  - `claude-3-5-sonnet` should match `claude-3-5-sonnet-20241022`
   *  - `sonnet` should match `claude-3-5-sonnet-20241022`, `claude-3-sonnet-20240229`, etc.
   *  - `claude` should match any Claude model
   *
   * The client MAY also map the string to a different provider's model name or a different model family, as long as it fills a similar niche; for example:
   *  - `gemini-1.5-flash` could match `claude-3-haiku-20240307`
   */
  name?: string;
}

/* Autocomplete */
/**
 * A request from the client to the server, to ask for completion options.
 */
export interface CompleteRequest extends Request {
  method: "completion/complete";
  params: {
    ref: PromptReference | ResourceReference;
    /**
     * The argument's information
     */
    argument: {
      /**
       * The name of the argument
       */
      name: string;
      /**
       * The value of the argument to use for completion matching.
       */
      value: string;
    };
  };
}

/**
 * The server's response to a completion/complete request
 */
export interface CompleteResult extends Result {
  completion: {
    /**
     * An array of completion values. Must not exceed 100 items.
     */
    values: string[];
    /**
     * The total number of completion options available. This can exceed the number of values actually sent in the response.
     */
    total?: number;
    /**
     * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
     */
    hasMore?: boolean;
  };
}

/**
 * A reference to a resource or resource template definition.
 */
export interface ResourceReference {
  type: "ref/resource";
  /**
   * The URI or URI template of the resource.
   *
   * @format uri-template
   */
  uri: string;
}

/**
 * Identifies a prompt.
 */
export interface PromptReference {
  type: "ref/prompt";
  /**
   * The name of the prompt or prompt template
   */
  name: string;
}

/* Roots */
/**
 * Sent from the server to request a list of root URIs from the client. Roots allow
 * servers to ask for specific directories or files to operate on. A common example
 * for roots is providing a set of repositories or directories a server should operate
 * on.
 *
 * This request is typically used when the server needs to understand the file system
 * structure or access specific locations that the client has permission to read from.
 */
export interface ListRootsRequest extends Request {
  method: "roots/list";
}

/**
 * The client's response to a roots/list request from the server.
 * This result contains an array of Root objects, each representing a root directory
 * or file that the server can operate on.
 */
export interface ListRootsResult extends Result {
  roots: Root[];
}

/**
 * Represents a root directory or file that the server can operate on.
 */
export interface Root {
  /**
   * The URI identifying the root. This *must* start with file:// for now.
   * This restriction may be relaxed in future versions of the protocol to allow
   * other URI schemes.
   *
   * @format uri
   */
  uri: string;
  /**
   * An optional name for the root. This can be used to provide a human-readable
   * identifier for the root, which may be useful for display purposes or for
   * referencing the root in other parts of the application.
   */
  name?: string;
}

/**
 * A notification from the client to the server, informing it that the list of roots has changed.
 * This notification should be sent whenever the client adds, removes, or modifies any root.
 * The server should then request an updated list of roots using the ListRootsRequest.
 */
export interface RootsListChangedNotification extends Notification {
  method: "notifications/roots/list_changed";
}

/* Client messages */
export type ClientRequest =
  | PingRequest
  | InitializeRequest
  | CompleteRequest
  | SetLevelRequest
  | GetPromptRequest
  | ListPromptsRequest
  | ListResourcesRequest
  | ReadResourceRequest
  | SubscribeRequest
  | UnsubscribeRequest
  | CallToolRequest
  | ListToolsRequest;

export type ClientNotification =
  | CancelledNotification
  | ProgressNotification
  | InitializedNotification
  | RootsListChangedNotification;

export type ClientResult = EmptyResult | CreateMessageResult | ListRootsResult;

/* Server messages */
export type ServerRequest =
  | PingRequest
  | CreateMessageRequest
  | ListRootsRequest;

export type ServerNotification =
  | CancelledNotification
  | ProgressNotification
  | LoggingMessageNotification
  | ResourceUpdatedNotification
  | ResourceListChangedNotification
  | ToolListChangedNotification
  | PromptListChangedNotification;

export type ServerResult =
  | EmptyResult
  | InitializeResult
  | CompleteResult
  | GetPromptResult
  | ListPromptsResult
  | ListResourcesResult
  | ReadResourceResult
  | CallToolResult
  | ListToolsResult;

Client Features
ℹ️
Protocol Revision: 2024-11-05
Clients can implement additional features to enrich connected MCP servers:
Roots
ℹ️
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) provides a standardized way for clients to expose filesystem “roots” to servers. Roots define the boundaries of where servers can operate within the filesystem, allowing them to understand which directories and files they have access to. Servers can request the list of roots from supporting clients and receive notifications when that list changes.
User Interaction Model

 
Roots in MCP are typically exposed through workspace or project configuration interfaces.
For example, implementations could offer a workspace/project picker that allows users to select directories and files the server should have access to. This can be combined with automatic workspace detection from version control systems or project files.
However, implementations are free to expose roots through any interface pattern that suits their needs—the protocol itself does not mandate any specific user interaction model.
Capabilities

 
Clients that support roots MUST declare the roots capability during initialization:
{
  "capabilities": {
    "roots": {
      "listChanged": true
    }
  }
}

listChanged indicates whether the client will emit notifications when the list of roots changes.
Protocol Messages

 
Listing Roots

 
To retrieve roots, servers send a roots/list request:
Request:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "roots/list"
}

Response:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "roots": [
      {
        "uri": "file:///home/user/projects/myproject",
        "name": "My Project"
      }
    ]
  }
}

Root List Changes

 
When roots change, clients that support listChanged MUST send a notification:
{
  "jsonrpc": "2.0",
  "method": "notifications/roots/list_changed"
}

Message Flow

 
Client
Server
Client
Server
Discovery
Changes
roots/list
Available roots
notifications/roots/list_changed
roots/list
Updated roots
Data Types

 
Root

 
A root definition includes:
	•	uri: Unique identifier for the root. This MUST be a file:// URI in the current specification.
	•	name: Optional human-readable name for display purposes.
Example roots for different use cases:
Project Directory

 
{
  "uri": "file:///home/user/projects/myproject",
  "name": "My Project"
}

Multiple Repositories

 
[
  {
    "uri": "file:///home/user/repos/frontend",
    "name": "Frontend Repository"
  },
  {
    "uri": "file:///home/user/repos/backend",
    "name": "Backend Repository"
  }
]

Error Handling

 
Clients SHOULD return standard JSON-RPC errors for common failure cases:
	•	Client does not support roots: -32601 (Method not found)
	•	Internal errors: -32603
Example error:
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Roots not supported",
    "data": {
      "reason": "Client does not have roots capability"
    }
  }
}

Security Considerations

 
	1	Clients MUST:
	•	Only expose roots with appropriate permissions
	•	Validate all root URIs to prevent path traversal
	•	Implement proper access controls
	•	Monitor root accessibility
	2	Servers SHOULD:
	•	Handle cases where roots become unavailable
	•	Respect root boundaries during operations
	•	Validate all paths against provided roots
Implementation Guidelines

 
	1	Clients SHOULD:
	•	Prompt users for consent before exposing roots to servers
	•	Provide clear user interfaces for root management
	•	Validate root accessibility before exposing
	•	Monitor for root changes
	2	Servers SHOULD:
	•	Check for roots capability before usage
	•	Handle root list changes gracefully
	•	Respect root boundaries in operations
	•	Cache root information appropriately

Sampling
ℹ️
Protocol Revision: 2024-11-05
The Model Context Protocol (MCP) provides a standardized way for servers to request LLM sampling (“completions” or “generations”) from language models via clients. This flow allows clients to maintain control over model access, selection, and permissions while enabling servers to leverage AI capabilities—with no server API keys necessary. Servers can request text or image-based interactions and optionally include context from MCP servers in their prompts.
User Interaction Model

 
Sampling in MCP allows servers to implement agentic behaviors, by enabling LLM calls to occur nested inside other MCP server features.
Implementations are free to expose sampling through any interface pattern that suits their needs—the protocol itself does not mandate any specific user interaction model.
⚠️
For trust & safety and security, there SHOULD always be a human in the loop with the ability to deny sampling requests.
Applications SHOULD:
	•	Provide UI that makes it easy and intuitive to review sampling requests
	•	Allow users to view and edit prompts before sending
	•	Present generated responses for review before delivery
Capabilities

 
Clients that support sampling MUST declare the sampling capability during initialization:
{
  "capabilities": {
    "sampling": {}
  }
}

Protocol Messages

 
Creating Messages

 
To request a language model generation, servers send a sampling/createMessage request:
Request:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sampling/createMessage",
  "params": {
    "messages": [
      {
        "role": "user",
        "content": {
          "type": "text",
          "text": "What is the capital of France?"
        }
      }
    ],
    "modelPreferences": {
      "hints": [
        {
          "name": "claude-3-sonnet"
        }
      ],
      "intelligencePriority": 0.8,
      "speedPriority": 0.5
    },
    "systemPrompt": "You are a helpful assistant.",
    "maxTokens": 100
  }
}

Response:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "role": "assistant",
    "content": {
      "type": "text",
      "text": "The capital of France is Paris."
    },
    "model": "claude-3-sonnet-20240307",
    "stopReason": "endTurn"
  }
}

Message Flow

 
LLM
User
Client
Server
LLM
User
Client
Server
Server initiates sampling
Human-in-the-loop review
Model interaction
Response review
Complete request
sampling/createMessage
Present request for approval
Review and approve/modify
Forward approved request
Return generation
Present response for approval
Review and approve/modify
Return approved response
Data Types

 
Messages

 
Sampling messages can contain:
Text Content

 
{
  "type": "text",
  "text": "The message content"
}

Image Content

 
{
  "type": "image",
  "data": "base64-encoded-image-data",
  "mimeType": "image/jpeg"
}

Model Preferences

 
Model selection in MCP requires careful abstraction since servers and clients may use different AI providers with distinct model offerings. A server cannot simply request a specific model by name since the client may not have access to that exact model or may prefer to use a different provider’s equivalent model.
To solve this, MCP implements a preference system that combines abstract capability priorities with optional model hints:
Capability Priorities

 
Servers express their needs through three normalized priority values (0-1):
	•	costPriority: How important is minimizing costs? Higher values prefer cheaper models.
	•	speedPriority: How important is low latency? Higher values prefer faster models.
	•	intelligencePriority: How important are advanced capabilities? Higher values prefer more capable models.
Model Hints

 
While priorities help select models based on characteristics, hints allow servers to suggest specific models or model families:
	•	Hints are treated as substrings that can match model names flexibly
	•	Multiple hints are evaluated in order of preference
	•	Clients MAY map hints to equivalent models from different providers
	•	Hints are advisory—clients make final model selection
For example:
{
  "hints": [
    {"name": "claude-3-sonnet"},  // Prefer Sonnet-class models
    {"name": "claude"}            // Fall back to any Claude model
  ],
  "costPriority": 0.3,            // Cost is less important
  "speedPriority": 0.8,           // Speed is very important
  "intelligencePriority": 0.5     // Moderate capability needs
}

The client processes these preferences to select an appropriate model from its available options. For instance, if the client doesn’t have access to Claude models but has Gemini, it might map the sonnet hint to gemini-1.5-pro based on similar capabilities.
Error Handling

 
Clients SHOULD return errors for common failure cases:
Example error:
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -1,
    "message": "User rejected sampling request"
  }
}