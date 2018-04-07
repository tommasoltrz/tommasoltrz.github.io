document.addEventListener('DOMContentLoaded', function() {

    var soundFile = document.createElement("audio");
    soundFile.preload = "auto";
    var videobg = document.getElementById("bgvid");

    //Load the sound file (using a source element for expandability)
    var src = document.createElement("source");
    src.src = "sounds/DaftPunk.mp3";
    soundFile.appendChild(src);

    //Load the audio tag
    //It auto plays as a fallback
    soundFile.load();
    soundFile.volume = 0.500000;
    soundFile.play();

    //Plays the sound
    function play() {
        //Set the current time for the audio file to the beginning
        soundFile.currentTime = 0.01;
        soundFile.volume = volume;

        //Due to a bug in Firefox, the audio needs to be played after a delay
        setTimeout(function() {
            soundFile.play();
        }, 1);
    }
    soundFile.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);

    meSpeak.loadConfig("mespeak_config.json");
    meSpeak.loadVoice("voices/en/en.json");

    var formFields = ['text', 'amplitude', 'wordgap', 'pitch', 'speed'];

    const keys = Array.from(document.querySelectorAll('.key'));
    keys.forEach(key => key.addEventListener('transitionend', removeTransition));

    function removeTransition(e) {
        if (e.propertyName !== 'transform') return;
        e.target.classList.remove('playing');
    }

    function playSound(e) {
        const key = document.querySelector(`div[data-key="${e.keyCode}"]`);
        if (key != null) {
            var word = key.getElementsByClassName("sound")[0].innerHTML;

            if (word == "Pause") {
                soundFile.pause();
                videobg.pause();
            } else if (word == "Play") {
                soundFile.play();
                videobg.play();
            } else {

                meSpeak.speak(word, {
                    amplitude: 70,
                    wordgap: 0,
                    pitch: 70,
                    speed: 254,
                    variant: "f1"
                });


            }

            key.classList.add('playing');
        }
    }

    window.addEventListener('keydown', playSound);

    var option = document.getElementById("gear");
    var button = document.getElementById("button");
    var visible = false;
    option.onclick = function() {
        document.getElementById("inputtext").style.visibility = visible ? "hidden" : "visible";
        visible = !visible;
    }

    button.onclick = function() {
        for (var a = 0; a < 8; a++) {
            var newvalue = document.getElementById("inputtext").getElementsByTagName('textarea')[a].value;
            console.log(newvalue);
            if (newvalue != "") {
              if(a==7) a=8;
                document.getElementsByClassName("sound")[a].innerHTML = newvalue;
            }
        }

    }

});
