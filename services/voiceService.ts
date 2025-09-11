
let voices: SpeechSynthesisVoice[] = [];
let bestVoice: SpeechSynthesisVoice | null = null;

// getVoices() can be asynchronous, so we need to load them and listen for changes.
const loadVoices = () => {
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && !bestVoice) {
        // Find a preferred voice. Google voices are often higher quality.
        // We prioritize voices that are high quality and local to the device.
        bestVoice = 
            voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en') && voice.localService) ||
            voices.find(voice => voice.name.toLowerCase().includes('natural') && voice.lang.startsWith('en') && voice.localService) ||
            voices.find(voice => voice.lang.startsWith('en-US') && voice.localService) ||
            voices.find(voice => voice.lang.startsWith('en') && voice.localService) ||
            voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en')) ||
            voices.find(voice => voice.name.toLowerCase().includes('natural') && voice.lang.startsWith('en')) ||
            voices.find(voice => voice.lang.startsWith('en-US')) ||
            voices.find(voice => voice.lang.startsWith('en')) ||
            null;
    }
};

// Initial load attempt
loadVoices();

// The 'voiceschanged' event is fired when the list of voices has been loaded and is ready.
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

interface SpeakOptions {
    onEnd?: () => void;
}

/**
 * Speaks the given text using the best available voice.
 * @param text The text to speak.
 * @param options An object with optional callbacks, like onEnd.
 */
export const speak = (text: string, options?: SpeakOptions) => {
    if (!window.speechSynthesis || !text) return;

    // Cancel any ongoing speech to prevent overlap.
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // If we found a preferred voice, use it.
    if (bestVoice) {
        utterance.voice = bestVoice;
    }
    
    // Adjust pitch and rate for a more natural tone.
    utterance.pitch = 1;
    utterance.rate = 1;

    // Set the onEnd callback if provided.
    if (options?.onEnd) {
        utterance.onend = options.onEnd;
    }

    window.speechSynthesis.speak(utterance);
};

/**
 * Immediately stops any currently active or queued speech synthesis.
 */
export const cancelSpeech = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}
