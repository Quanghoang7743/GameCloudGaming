/**
 * Keyboard mapping utilities
 * Converts browser KeyboardEvent codes to Stream virtual keys
 */

import { StreamKeys, StreamKeyModifiers } from '../constants';

export function convertToModifiers(event: KeyboardEvent): number {
    let modifiers = 0;

    if (event.shiftKey) {
        modifiers |= StreamKeyModifiers.MASK_SHIFT;
    }
    if (event.ctrlKey) {
        modifiers |= StreamKeyModifiers.MASK_CTRL;
    }
    if (event.altKey) {
        modifiers |= StreamKeyModifiers.MASK_ALT;
    }
    if (event.metaKey) {
        modifiers |= StreamKeyModifiers.MASK_META;
    }

    return modifiers;
}

// Keyboard code to Virtual Key mappings
const VK_MAPPINGS: Record<string, number | null> = {
    Unidentified: null,
    Escape: StreamKeys.VK_ESCAPE,
    Digit1: StreamKeys.VK_KEY_1,
    Digit2: StreamKeys.VK_KEY_2,
    Digit3: StreamKeys.VK_KEY_3,
    Digit4: StreamKeys.VK_KEY_4,
    Digit5: StreamKeys.VK_KEY_5,
    Digit6: StreamKeys.VK_KEY_6,
    Digit7: StreamKeys.VK_KEY_7,
    Digit8: StreamKeys.VK_KEY_8,
    Digit9: StreamKeys.VK_KEY_9,
    Digit0: StreamKeys.VK_KEY_0,
    Minus: StreamKeys.VK_OEM_MINUS,
    Equal: StreamKeys.VK_OEM_PLUS,
    Backspace: StreamKeys.VK_BACK,
    Tab: StreamKeys.VK_TAB,
    KeyQ: StreamKeys.VK_KEY_Q,
    KeyW: StreamKeys.VK_KEY_W,
    KeyE: StreamKeys.VK_KEY_E,
    KeyR: StreamKeys.VK_KEY_R,
    KeyT: StreamKeys.VK_KEY_T,
    KeyY: StreamKeys.VK_KEY_Y,
    KeyU: StreamKeys.VK_KEY_U,
    KeyI: StreamKeys.VK_KEY_I,
    KeyO: StreamKeys.VK_KEY_O,
    KeyP: StreamKeys.VK_KEY_P,
    BracketLeft: StreamKeys.VK_OEM_4,
    BracketRight: StreamKeys.VK_OEM_6,
    Enter: StreamKeys.VK_RETURN,
    ControlLeft: StreamKeys.VK_LCONTROL,
    KeyA: StreamKeys.VK_KEY_A,
    KeyS: StreamKeys.VK_KEY_S,
    KeyD: StreamKeys.VK_KEY_D,
    KeyF: StreamKeys.VK_KEY_F,
    KeyG: StreamKeys.VK_KEY_G,
    KeyH: StreamKeys.VK_KEY_H,
    KeyJ: StreamKeys.VK_KEY_J,
    KeyK: StreamKeys.VK_KEY_K,
    KeyL: StreamKeys.VK_KEY_L,
    Semicolon: StreamKeys.VK_OEM_1,
    Quote: StreamKeys.VK_OEM_7,
    Backquote: StreamKeys.VK_OEM_3,
    ShiftLeft: StreamKeys.VK_LSHIFT,
    Backslash: StreamKeys.VK_OEM_5,
    KeyZ: StreamKeys.VK_KEY_Z,
    KeyX: StreamKeys.VK_KEY_X,
    KeyC: StreamKeys.VK_KEY_C,
    KeyV: StreamKeys.VK_KEY_V,
    KeyB: StreamKeys.VK_KEY_B,
    KeyN: StreamKeys.VK_KEY_N,
    KeyM: StreamKeys.VK_KEY_M,
    Comma: StreamKeys.VK_OEM_COMMA,
    Period: StreamKeys.VK_OEM_PERIOD,
    Slash: StreamKeys.VK_OEM_2,
    ShiftRight: StreamKeys.VK_RSHIFT,
    NumpadMultiply: StreamKeys.VK_MULTIPLY,
    AltLeft: StreamKeys.VK_LMENU,
    Space: StreamKeys.VK_SPACE,
    CapsLock: StreamKeys.VK_CAPITAL,
    F1: StreamKeys.VK_F1,
    F2: StreamKeys.VK_F2,
    F3: StreamKeys.VK_F3,
    F4: StreamKeys.VK_F4,
    F5: StreamKeys.VK_F5,
    F6: StreamKeys.VK_F6,
    F7: StreamKeys.VK_F7,
    F8: StreamKeys.VK_F8,
    F9: StreamKeys.VK_F9,
    F10: StreamKeys.VK_F10,
    Pause: StreamKeys.VK_PAUSE,
    ScrollLock: StreamKeys.VK_SCROLL,
    Numpad7: StreamKeys.VK_NUMPAD7,
    Numpad8: StreamKeys.VK_NUMPAD8,
    Numpad9: StreamKeys.VK_NUMPAD9,
    NumpadSubtract: StreamKeys.VK_SUBTRACT,
    Numpad4: StreamKeys.VK_NUMPAD4,
    Numpad5: StreamKeys.VK_NUMPAD5,
    Numpad6: StreamKeys.VK_NUMPAD6,
    NumpadAdd: StreamKeys.VK_ADD,
    Numpad1: StreamKeys.VK_NUMPAD1,
    Numpad2: StreamKeys.VK_NUMPAD2,
    Numpad3: StreamKeys.VK_NUMPAD3,
    Numpad0: StreamKeys.VK_NUMPAD0,
    NumpadDecimal: StreamKeys.VK_DECIMAL,
    PrintScreen: StreamKeys.VK_SNAPSHOT,
    IntlBackslash: StreamKeys.VK_OEM_102,
    F11: StreamKeys.VK_F11,
    F12: StreamKeys.VK_F12,
    NumpadEqual: null,
    ControlRight: StreamKeys.VK_RCONTROL,
    AltRight: StreamKeys.VK_RMENU,
    MetaLeft: StreamKeys.VK_LWIN,
    MetaRight: StreamKeys.VK_RWIN,
    ContextMenu: StreamKeys.VK_APPS,
    NumLock: StreamKeys.VK_NUMLOCK,
    NumpadEnter: StreamKeys.VK_RETURN,
    AudioVolumeMute: StreamKeys.VK_VOLUME_MUTE,
    AudioVolumeDown: StreamKeys.VK_VOLUME_DOWN,
    AudioVolumeUp: StreamKeys.VK_VOLUME_UP,
    MediaTrackPrevious: StreamKeys.VK_MEDIA_PREV_TRACK,
    MediaTrackNext: StreamKeys.VK_MEDIA_NEXT_TRACK,
    MediaPlayPause: StreamKeys.VK_MEDIA_PLAY_PAUSE,
    MediaStop: StreamKeys.VK_MEDIA_STOP,
    BrowserHome: StreamKeys.VK_BROWSER_HOME,
    BrowserSearch: StreamKeys.VK_BROWSER_SEARCH,
    BrowserFavorites: StreamKeys.VK_BROWSER_FAVORITES,
    BrowserRefresh: StreamKeys.VK_BROWSER_REFRESH,
    BrowserStop: StreamKeys.VK_BROWSER_STOP,
    BrowserForward: StreamKeys.VK_BROWSER_FORWARD,
    BrowserBack: StreamKeys.VK_BROWSER_BACK,
    LaunchApp1: StreamKeys.VK_LAUNCH_APP1,
    LaunchApp2: StreamKeys.VK_LAUNCH_APP2,
    LaunchMail: StreamKeys.VK_LAUNCH_MAIL,
    MediaSelect: StreamKeys.VK_MEDIA_SELECT,
    Convert: StreamKeys.VK_CONVERT,
    NonConvert: StreamKeys.VK_NONCONVERT,
    KanaMode: StreamKeys.VK_KANA,
    Lang1: StreamKeys.VK_HANGUL,
    Lang2: StreamKeys.VK_JUNJA,
    IntlRo: StreamKeys.VK_OEM_102,
    IntlYen: null,
    NumpadComma: null,
    Power: null,
    Sleep: StreamKeys.VK_SLEEP,
    WakeUp: null,
    Fn: null,
    NumpadDivide: StreamKeys.VK_DIVIDE,
    PageUp: StreamKeys.VK_PRIOR,
    Delete: StreamKeys.VK_DELETE,
    End: StreamKeys.VK_END,
    ArrowLeft: StreamKeys.VK_LEFT,
    ArrowRight: StreamKeys.VK_RIGHT,
    ArrowDown: StreamKeys.VK_DOWN,
    ArrowUp: StreamKeys.VK_UP,
    PageDown: StreamKeys.VK_NEXT,
    Insert: StreamKeys.VK_INSERT,
    VolumeMute: StreamKeys.VK_VOLUME_MUTE,
    Again: null,
    Select: StreamKeys.VK_SELECT,
    Open: null,
    Find: null,
    Home: StreamKeys.VK_HOME,
    Props: null,
};

export function convertToKey(event: KeyboardEvent): number | null {
    let key = VK_MAPPINGS[event.code] ?? null;
    if (key == null) {
        key = VK_MAPPINGS[event.key] ?? null;
    }
    return key;
}
