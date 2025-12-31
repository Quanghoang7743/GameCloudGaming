var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { pipelineToString } from "./index.js";
import { addPipePassthrough } from "./pipes.js";
export function createPipelineWorker() {
    if (!("Worker" in window)) {
        return null;
    }
    return new Worker(new URL("worker.js", import.meta.url), { type: "module" });
}
function checkWorkerSupport(className) {
    return new Promise((resolve, reject) => {
        const worker = createPipelineWorker();
        if (!worker) {
            resolve(false);
            return;
        }
        worker.onerror = reject;
        worker.onmessageerror = reject;
        worker.onmessage = (message) => {
            const data = message.data;
            if ("checkSupport" in data) {
                resolve(data.checkSupport.supported);
                worker.terminate();
            }
            else {
                throw `Received invalid message whilst checking support of a worker ${JSON.stringify(data)}`;
            }
        };
        const request = {
            checkSupport: { className }
        };
        worker.postMessage(request);
    });
}
export function checkExecutionEnvironment(className) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            main: className in window,
            worker: yield checkWorkerSupport(className),
        };
    });
}
export class WorkerPipe {
    static getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                // TODO: check in the actual worker for support
                executionEnvironment: yield checkExecutionEnvironment("Worker")
            };
        });
    }
    constructor(base, pipeline, logger) {
        this.implementationName = `worker_pipe [${pipelineToString(pipeline)}] -> ${base.implementationName}`;
        this.logger = logger !== null && logger !== void 0 ? logger : null;
        // TODO: check that the pipeline starts with output and ends with input
        this.base = base;
        this.pipeline = pipeline;
        const worker = createPipelineWorker();
        if (!worker) {
            throw "Failed to create worker pipeline: Workers not supported!";
        }
        this.worker = worker;
        this.worker.onmessage = this.onReceiveWorkerMessage.bind(this);
        addPipePassthrough(this);
    }
    onWorkerMessage(input) {
        const message = { input };
        this.worker.postMessage(message);
    }
    onReceiveWorkerMessage(event) {
        var _a;
        const data = event.data;
        if ("output" in data) {
            this.base.onWorkerMessage(data.output);
        }
        else if ("log" in data) {
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug(data.log, data.info);
        }
    }
    setup(setup) {
        const message2 = {
            createPipeline: this.pipeline
        };
        this.worker.postMessage(message2);
        this.onWorkerMessage({ videoSetup: setup });
        if ("setup" in this.base && typeof this.base.setup == "function") {
            return this.base.setup(...arguments);
        }
    }
    cleanup() {
        this.worker.terminate();
        if ("cleanup" in this.base && typeof this.base.cleanup == "function") {
            return this.base.cleanup(...arguments);
        }
    }
    getBase() {
        return this.base;
    }
}
export function workerPipe(name, pipeline) {
    // TODO: use name somehow
    class CustomWorkerPipe extends WorkerPipe {
        constructor(base, logger) {
            super(base, pipeline, logger);
        }
    }
    CustomWorkerPipe.baseType = "workeroutput";
    CustomWorkerPipe.type = "workerinput";
    return CustomWorkerPipe;
}
