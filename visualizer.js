window.addEventListener("DOMContentLoaded",()=>{

    const canvas = document.getElementById("viz");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");

    const audio = window.audio || window.webkitAudioContext;
    const analyser = window.audioContext?.createAnalyser?.() || null;

});
