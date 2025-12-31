var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CanvasVideoRenderer } from "./canvas_element.js";
import { VideoElementRenderer } from "./video_element.js";
import { VideoMediaStreamTrackProcessorPipe } from "./media_stream_track_processor_pipe.js";
import { VideoDecoderPipe } from "./video_decoder_pipe.js";
import { DepacketizeVideoPipe } from "./depackitize_video_pipe.js";
import { VideoTrackGeneratorPipe } from "./video_track_generator.js";
import { VideoMediaStreamTrackGeneratorPipe } from "./media_stream_track_generator_pipe.js";
import { andVideoCodecs, hasAnyCodec } from "../video.js";
import { buildPipeline, gatherPipeInfo } from "../pipeline/index.js";
import { workerPipe } from "../pipeline/worker_pipe.js";
import { WorkerDataSendPipe, WorkerVideoFrameReceivePipe } from "../pipeline/worker_io.js";
// -- Custom worker pipelines
const TestWorkerPipeline1 = workerPipe("TestWorkerPipeline1", { pipes: ["WorkerDataReceivePipe", "DepacketizeVideoPipe", "VideoDecoderPipe", "WorkerVideoFrameSendPipe"] });
// TODO: print info
const VIDEO_RENDERERS = [
    VideoElementRenderer,
    CanvasVideoRenderer,
];
const FORCE_CANVAS_PIPELINES = [
    { input: "videotrack", pipes: [VideoMediaStreamTrackProcessorPipe], renderer: CanvasVideoRenderer },
    { input: "data", pipes: [DepacketizeVideoPipe, VideoDecoderPipe], renderer: CanvasVideoRenderer },
];
const PIPELINES = [
    { input: "videotrack", pipes: [], renderer: VideoElementRenderer },
    { input: "videotrack", pipes: [], renderer: VideoElementRenderer },
    { input: "videotrack", pipes: [VideoMediaStreamTrackProcessorPipe], renderer: CanvasVideoRenderer },
    { input: "data", pipes: [DepacketizeVideoPipe, VideoDecoderPipe, VideoMediaStreamTrackGeneratorPipe], renderer: VideoElementRenderer },
    { input: "data", pipes: [DepacketizeVideoPipe, VideoDecoderPipe, VideoTrackGeneratorPipe], renderer: VideoElementRenderer },
    { input: "data", pipes: [DepacketizeVideoPipe, VideoDecoderPipe], renderer: CanvasVideoRenderer },
];
const TEST_PIPELINES = [
    { input: "data", pipes: [WorkerDataSendPipe, TestWorkerPipeline1, WorkerVideoFrameReceivePipe], renderer: CanvasVideoRenderer }
];
export function buildVideoPipeline(type, settings, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        const pipesInfo = yield gatherPipeInfo();
        logger === null || logger === void 0 ? void 0 : logger.debug(`Building video pipeline with output "${type}"`);
        let pipelines = [];
        // Forced renderer
        if (settings.canvasRenderer) {
            logger === null || logger === void 0 ? void 0 : logger.debug("Forcing canvas renderer");
            pipelines = FORCE_CANVAS_PIPELINES;
        }
        else {
            logger === null || logger === void 0 ? void 0 : logger.debug("Selecting pipeline automatically");
            pipelines = PIPELINES;
        }
        // TODO: REMOVE TEST PIPELINES!
        // pipelines = TEST_PIPELINES
        pipelineLoop: for (const pipeline of pipelines) {
            if (pipeline.input != type) {
                continue;
            }
            // Check if supported and contains codecs
            let supportedCodecs = settings.supportedVideoCodecs;
            for (const pipe of pipeline.pipes) {
                const pipeInfo = pipesInfo.get(pipe);
                if (!pipeInfo) {
                    logger === null || logger === void 0 ? void 0 : logger.debug(`Failed to query info for video pipe ${pipe.name}`);
                    continue pipelineLoop;
                }
                if (!pipeInfo.executionEnvironment.main) {
                    continue pipelineLoop;
                }
                if (pipeInfo.supportedVideoCodecs) {
                    supportedCodecs = andVideoCodecs(supportedCodecs, pipeInfo.supportedVideoCodecs);
                }
            }
            const rendererInfo = yield pipeline.renderer.getInfo();
            if (!rendererInfo) {
                logger === null || logger === void 0 ? void 0 : logger.debug(`Failed to query info for video renderer ${pipeline.renderer.name}`);
                continue pipelineLoop;
            }
            if (!rendererInfo.executionEnvironment.main) {
                continue pipelineLoop;
            }
            if (rendererInfo.supportedVideoCodecs) {
                supportedCodecs = andVideoCodecs(supportedCodecs, rendererInfo.supportedVideoCodecs);
            }
            if (!hasAnyCodec(supportedCodecs)) {
                logger === null || logger === void 0 ? void 0 : logger.debug(`Not using pipe ${pipeline.pipes.map(pipe => pipe.name).join(" -> ")} -> ${pipeline.renderer.name} (renderer) because it doesn't support any codec the user wants`);
                continue pipelineLoop;
            }
            // Build that pipeline
            const videoRenderer = buildPipeline(pipeline.renderer, { pipes: pipeline.pipes }, logger);
            if (!videoRenderer) {
                logger === null || logger === void 0 ? void 0 : logger.debug("Failed to build video pipeline");
                return { videoRenderer: null, supportedCodecs: null, error: true };
            }
            return { videoRenderer: videoRenderer, supportedCodecs, error: false };
        }
        logger === null || logger === void 0 ? void 0 : logger.debug("No supported video renderer found!");
        return { videoRenderer: null, supportedCodecs: null, error: true };
    });
}
