import { Logger } from "../log.js";
import { buildPipeline } from "./index.js";
// Configure logger
const logger = new Logger();
function onLog(text, type) {
    const message = {
        log: text,
        info: { type: type !== null && type !== void 0 ? type : undefined }
    };
    postMessage(message);
}
logger === null || logger === void 0 ? void 0 : logger.addInfoListener(onLog);
let pipelineErrored = false;
let currentPipeline = null;
class WorkerMessageSender {
    constructor(logger) {
        this.implementationName = "worker_output";
    }
    onWorkerMessage(output) {
        const message = { output };
        postMessage(message);
    }
    getBase() {
        return null;
    }
}
WorkerMessageSender.type = "workerinput";
function onMessage(message) {
    if ("checkSupport" in message) {
        const className = message.checkSupport.className;
        const supported = className in self;
        const response = {
            checkSupport: { supported }
        };
        postMessage(response);
    }
    else if ("createPipeline" in message) {
        const pipeline = message.createPipeline;
        const newPipeline = buildPipeline(WorkerMessageSender, pipeline, logger);
        if (newPipeline && "onWorkerMessage" in newPipeline && typeof newPipeline.onWorkerMessage == "function") {
            currentPipeline = newPipeline;
        }
        else {
            logger.debug("Failed to build worker pipeline!", { type: "fatal" });
        }
    }
    else if ("input" in message) {
        if (pipelineErrored) {
            return;
        }
        if (currentPipeline) {
            currentPipeline.onWorkerMessage(message.input);
        }
        else {
            pipelineErrored = true;
            logger.debug("Failed to submit worker pipe input because pipeline errored!");
        }
    }
}
onmessage = (event) => {
    const message = event.data;
    onMessage(message);
};
