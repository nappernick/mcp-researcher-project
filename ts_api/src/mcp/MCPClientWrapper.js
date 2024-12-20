"use strict";
// src/mcp/MCPClientWrapper.ts
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClientWrapper = void 0;
var child_process_1 = require("child_process");
var readline = require("readline");
var MCPClientWrapper = /** @class */ (function () {
    function MCPClientWrapper(config) {
        this.process = null;
        this.rl = null;
        this.config = config;
    }
    /**
     * Connects to the Python NLP server by spawning the process.
     */
    MCPClientWrapper.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a;
                        _this.process = (0, child_process_1.spawn)(_this.config.serverCommand, __spreadArray([_this.config.serverPath], _this.config.serverArgs, true), {
                            stdio: ['pipe', 'pipe', 'pipe'],
                        });
                        _this.process.on('error', reject);
                        (_a = _this.process.stderr) === null || _a === void 0 ? void 0 : _a.on('data', function (data) { return console.error('Python stderr:', data.toString()); });
                        _this.rl = readline.createInterface({ input: _this.process.stdout });
                        _this.rl.on('line', function (line) {
                            try {
                                var response = JSON.parse(line);
                                if (_this.pendingRequest && response.id === _this.pendingRequest.id) {
                                    if (response.error) {
                                        _this.pendingRequest.reject(new Error(response.error.message));
                                    }
                                    else {
                                        _this.pendingRequest.resolve(response.result);
                                    }
                                    _this.pendingRequest = undefined;
                                }
                            }
                            catch (err) {
                                console.error('Failed to parse response:', line);
                            }
                        });
                        // Allow the process some time to start
                        setTimeout(function () { return resolve(); }, 1000);
                    })];
            });
        });
    };
    /**
     * Disconnects from the Python NLP server by killing the process.
     */
    MCPClientWrapper.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.process) {
                    this.process.kill();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Sends a JSON-RPC request to the Python NLP server and waits for the response.
     * @param toolName The name of the tool to call.
     * @param args The arguments for the tool.
     * @returns The result from the NLP server.
     */
    MCPClientWrapper.prototype.callTool = function (toolName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.process || !this.rl) {
                    throw new Error("MCPClient not connected");
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var requestId = "1"; // For simplicity, use a static ID per call (one call at a time)
                        _this.pendingRequest = { resolve: resolve, reject: reject, id: requestId };
                        var request = {
                            jsonrpc: "2.0",
                            method: "call_tool",
                            params: { name: toolName, arguments: args },
                            id: requestId,
                        };
                        _this.process.stdin.write(JSON.stringify(request) + "\n");
                    })];
            });
        });
    };
    return MCPClientWrapper;
}());
exports.MCPClientWrapper = MCPClientWrapper;
