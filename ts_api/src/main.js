"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mcp_wrapper_1 = require("mcp-wrapper");
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var zod_1 = require("zod");
var promises_1 = require("fs/promises");
var path_1 = require("path");
// Initialize model provider
var modelProvider = mcp_wrapper_1.ProviderFactory.getProvider();
console.warn("Using provider: ".concat(process.env.PROVIDER_NAME));
// If you have a downstream server for tools, configure this:
var toolClient = null;
// If downstream tool usage is needed, initialize toolClient:
// toolClient = new MCPClientWrapper({
//   serverCommand: 'node',
//   serverPath: './downstreamServer.js',
//   serverArgs: []
// });
// await toolClient.connect();
// Zod Schemas
var GenerateSchema = zod_1.z.object({
    jsonrpc: zod_1.z.literal("2.0"),
    method: zod_1.z.literal("generate"),
    params: zod_1.z.object({
        prompt: zod_1.z.string(),
        options: zod_1.z.any().optional()
    }),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()])
});
var GenerateWithToolsSchema = zod_1.z.object({
    jsonrpc: zod_1.z.literal("2.0"),
    method: zod_1.z.literal("generate_with_tools"),
    params: zod_1.z.object({
        messages: zod_1.z.array(zod_1.z.object({
            role: zod_1.z.enum(["user", "assistant", "system", "function"]),
            content: zod_1.z.string().optional(),
            name: zod_1.z.string().optional(),
        })),
        tools: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            description: zod_1.z.string(),
            input_schema: zod_1.z.any().optional()
        })),
        options: zod_1.z.any().optional(),
    }),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()])
});
var ContinueWithToolResultSchema = zod_1.z.object({
    jsonrpc: zod_1.z.literal("2.0"),
    method: zod_1.z.literal("continue_with_tool_result"),
    params: zod_1.z.object({
        messages: zod_1.z.array(zod_1.z.object({
            role: zod_1.z.enum(["user", "assistant", "system", "function"]),
            content: zod_1.z.string().optional(),
            name: zod_1.z.string().optional(),
        })),
        tools: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            description: zod_1.z.string(),
            input_schema: zod_1.z.any().optional()
        })),
        toolResults: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            result: zod_1.z.any(),
            tool_use_id: zod_1.z.string().optional(),
        })),
        options: zod_1.z.any().optional(),
    }),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()])
});
var ResourcesReadSchema = zod_1.z.object({
    jsonrpc: zod_1.z.literal("2.0"),
    method: zod_1.z.literal("resources/read"),
    params: zod_1.z.object({
        uri: zod_1.z.string(),
    }),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()])
});
// Create the MCP Server
var server = new index_js_1.Server({
    name: "nlp-wrapper",
    version: "1.0.0"
}, {
    capabilities: {
        resources: {}
    }
});
// Handlers
function handleGenerate(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, prompt, options, content, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = request.params, prompt = _a.prompt, options = _a.options;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    console.warn("Handling 'generate' request: prompt=\"".concat(prompt, "\""));
                    return [4 /*yield*/, modelProvider.generateResponse(prompt, options)];
                case 2:
                    content = _b.sent();
                    return [2 /*return*/, { content: content }];
                case 3:
                    error_1 = _b.sent();
                    console.warn('Error in generate:', error_1);
                    throw { code: -32000, message: error_1.message };
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleGenerateWithTools(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, messages, tools, options, initialResult, toolResults, _i, _b, call, toolResult, continueResult, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = request.params, messages = _a.messages, tools = _a.tools, options = _a.options;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 10, , 11]);
                    console.warn('Handling generate_with_tools request');
                    return [4 /*yield*/, modelProvider.generateWithTools(messages, tools, options)];
                case 2:
                    initialResult = _c.sent();
                    if (!(initialResult.toolCalls && initialResult.toolCalls.length > 0 && toolClient)) return [3 /*break*/, 8];
                    toolResults = [];
                    _i = 0, _b = initialResult.toolCalls;
                    _c.label = 3;
                case 3:
                    if (!(_i < _b.length)) return [3 /*break*/, 6];
                    call = _b[_i];
                    return [4 /*yield*/, toolClient.callTool(call.name, call.arguments)];
                case 4:
                    toolResult = _c.sent();
                    toolResults.push({
                        name: call.name,
                        result: toolResult
                    });
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, modelProvider.continueWithToolResult(messages, tools, toolResults, options)];
                case 7:
                    continueResult = _c.sent();
                    return [2 /*return*/, continueResult];
                case 8: 
                // No tool calls or no toolClient configured, just return initialResult
                return [2 /*return*/, initialResult];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _c.sent();
                    console.warn('Error in generate_with_tools:', error_2);
                    throw { code: -32000, message: error_2.message };
                case 11: return [2 /*return*/];
            }
        });
    });
}
function handleContinueWithToolResult(request) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, messages, tools, toolResults, options, result, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = request.params, messages = _a.messages, tools = _a.tools, toolResults = _a.toolResults, options = _a.options;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    console.warn('Handling continue_with_tool_result request');
                    return [4 /*yield*/, modelProvider.continueWithToolResult(messages, tools, toolResults, options)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, result];
                case 3:
                    error_3 = _b.sent();
                    console.warn('Error in continue_with_tool_result:', error_3);
                    throw { code: -32000, message: error_3.message };
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleResourcesRead(request) {
    return __awaiter(this, void 0, void 0, function () {
        var uri, url, filePath, contentBuffer, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    uri = request.params.uri;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.warn("Handling resources/read for uri: ".concat(uri));
                    url = new URL(uri);
                    if (url.protocol !== 'file:') {
                        throw new Error("Only file:// URIs are supported");
                    }
                    filePath = path_1.default.resolve(url.pathname);
                    return [4 /*yield*/, promises_1.default.readFile(filePath)];
                case 2:
                    contentBuffer = _a.sent();
                    // Assume text for simplicity
                    return [2 /*return*/, {
                            contents: [{
                                    uri: uri,
                                    mimeType: "text/plain",
                                    text: contentBuffer.toString("utf-8")
                                }]
                        }];
                case 3:
                    error_4 = _a.sent();
                    console.warn('Error in resources/read:', error_4);
                    throw { code: -32000, message: error_4.message };
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Register Handlers
server.setRequestHandler(GenerateSchema, handleGenerate);
server.setRequestHandler(GenerateWithToolsSchema, handleGenerateWithTools);
server.setRequestHandler(ContinueWithToolResultSchema, handleContinueWithToolResult);
server.setRequestHandler(ResourcesReadSchema, handleResourcesRead);
// Start the server
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var transport, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.warn("Starting NLP MCP wrapper server using stdio transport...");
                transport = new stdio_js_1.StdioServerTransport();
                return [4 /*yield*/, server.connect(transport)];
            case 1:
                _a.sent();
                console.warn("NLP MCP wrapper server started and running.");
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.warn("Failed to start MCP server: ".concat(error_5.message), { error: error_5 });
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
