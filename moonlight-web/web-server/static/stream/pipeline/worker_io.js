var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { addPipePassthrough } from "./pipes.js";
class WorkerReceiverPipe {
    static getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                executionEnvironment: {
                    main: true,
                    worker: true,
                }
            };
        });
    }
    constructor(base) {
        this.implementationName = `worker_recv -> ${base.implementationName}`;
        this.base = base;
        addPipePassthrough(this, ["setup", "cleanup", "submitFrame", "submitPacket"]);
    }
    onWorkerMessage(message) {
        if ("call" in message && message.call == "cleanup") {
            this.cleanup();
        }
        else if ("videoSetup" in message) {
            this.setup(message.videoSetup);
        }
        else if ("videoFrame" in message) {
            this.submitFrame(message.videoFrame);
        }
        else if ("data" in message) {
            this.submitPacket(message.data);
        }
    }
    getBase() {
        return this.base;
    }
    // -- Only definition look addPipePassthrough
    setup(_setup) { }
    cleanup() { }
    submitFrame(_frame) { }
    submitPacket(_buffer) { }
}
WorkerReceiverPipe.type = "workeroutput";
export class WorkerVideoFrameReceivePipe extends WorkerReceiverPipe {
}
WorkerVideoFrameReceivePipe.baseType = "videoframe";
export class WorkerDataReceivePipe extends WorkerReceiverPipe {
}
WorkerDataReceivePipe.baseType = "data";
class WorkerSenderPipe {
    static getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                executionEnvironment: {
                    main: true,
                    worker: true
                }
            };
        });
    }
    constructor(base, _logger) {
        this.implementationName = `worker_send -> ${base.implementationName}`;
        this.base = base;
        addPipePassthrough(this);
    }
    getBase() {
        return this.base;
    }
    // Setup is handled in the WorkerPipe
    submitFrame(videoFrame) {
        this.getBase().onWorkerMessage({ videoFrame });
    }
    submitPacket(data) {
        this.getBase().onWorkerMessage({ data });
    }
}
WorkerSenderPipe.baseType = "workerinput";
export class WorkerVideoFrameSendPipe extends WorkerSenderPipe {
}
WorkerVideoFrameSendPipe.type = "videoframe";
export class WorkerDataSendPipe extends WorkerSenderPipe {
}
WorkerDataSendPipe.type = "data";
