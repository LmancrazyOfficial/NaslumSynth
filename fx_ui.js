// Wait until DOM is ready
window.addEventListener("DOMContentLoaded",()=>{

    const reverb = document.getElementById("reverb");
    const delay = document.getElementById("delay");
    const feedback = document.getElementById("feedback");
    const distortion = document.getElementById("distortion");

    function update(){

        window.FX_STATE.reverbWet = parseFloat(reverb.value);
        window.FX_STATE.delayTime = parseFloat(delay.value);
        window.FX_STATE.delayFeedback = parseFloat(feedback.value);
        window.FX_STATE.distortion = parseFloat(distortion.value);

        window.updateFX();
    }

    [reverb,delay,feedback,distortion]
    .forEach(el=>{
        el.addEventListener("input",update);
    });

});
