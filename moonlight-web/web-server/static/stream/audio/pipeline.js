var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AudioDecoderPipe } from "./audio_decoder_pipe.js";
import { AudioElementPlayer } from "./audio_element.js";
import { AudioMediaStreamTrackGeneratorPipe } from "./media_stream_track_generator_pipe.js";
import { buildPipeline, gatherPipeInfo } from "../pipeline/index.js";
// TODO: print info
const AUDIO_PLAYERS = [
    AudioElementPlayer
];
const PIPELINES = [
    { input: "audiotrack", pipes: [], player: AudioElementPlayer },
    { input: "data", pipes: [AudioDecoderPipe, AudioMediaStreamTrackGeneratorPipe], player: AudioElementPlayer }
];
export function buildAudioPipeline(type, settings, logger) {
    return __awaiter(this, void 0, void 0, function* () {
        logger === null || logger === void 0 ? void 0 : logger.debug(`Building audio pipeline with output "${type}"`);
        const pipesInfo = yield gatherPipeInfo();
        const pipelines = PIPELINES;
        // TODO: use the depacketize pipe
        // TODO: create a opus decoder using other js sound apis
        pipelineLoop: for (const pipeline of pipelines) {
            if (pipeline.input != type) {
                continue;
            }
            // Check if supported
            for (const pipe of pipeline.pipes) {
                const pipeInfo = pipesInfo.get(pipe);
                if (!pipeInfo) {
                    logger === null || logger === void 0 ? void 0 : logger.debug(`Failed to query info for audio pipe ${pipe.name}`);
                    continue pipelineLoop;
                }
                if (!pipeInfo.executionEnvironment.main) {
                    continue pipelineLoop;
                }
            }
            const playerInfo = yield pipeline.player.getInfo();
            if (!playerInfo) {
                logger === null || logger === void 0 ? void 0 : logger.debug(`Failed to query info for audio player ${pipeline.player.name}`);
                continue pipelineLoop;
            }
            if (!playerInfo.executionEnvironment.main) {
                continue pipelineLoop;
            }
            // Build that pipeline
            const audioPlayer = buildPipeline(pipeline.player, { pipes: pipeline.pipes }, logger);
            if (!audioPlayer) {
                logger === null || logger === void 0 ? void 0 : logger.debug("Failed to build audio pipeline");
                return { audioPlayer: null, error: true };
            }
            return { audioPlayer: audioPlayer, error: false };
        }
        logger === null || logger === void 0 ? void 0 : logger.debug("No supported audio player found!");
        return { audioPlayer: null, error: true };
    });
}
