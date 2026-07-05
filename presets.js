// ---------- NaslumSynth Presets ----------

window.PRESETS = {

    "Grand Piano": {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.3,
        waveform: "sine"
    },

    "Electric Piano": {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.5,
        release: 0.4,
        waveform: "triangle"
    },

    "Organ": {
        attack: 0.05,
        decay: 0.1,
        sustain: 0.9,
        release: 0.2,
        waveform: "square"
    },

    "Bass": {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.8,
        release: 0.25,
        waveform: "sawtooth"
    },

    "Pad": {
        attack: 0.6,
        decay: 0.4,
        sustain: 0.7,
        release: 1.2,
        waveform: "sine"
    },

    "Bell": {
        attack: 0.005,
        decay: 0.8,
        sustain: 0.2,
        release: 1.5,
        waveform: "sine"
    }

};

// ---------- Default State ----------

window.SYNTH_STATE = {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.7,
    release: 0.3,
    waveform: "sine"
};
