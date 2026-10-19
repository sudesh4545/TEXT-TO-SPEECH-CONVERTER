(function () {
        "use strict";
        var voices = [],
          paused = false,
          $ = function (x) {
            return document.getElementById(x);
          };
        function load() {
          voices = speechSynthesis.getVoices();
          var filter = $("lang").value,
            current = $("voice").value;
          $("voice").innerHTML = "";
          voices
            .filter(function (v) {
              return (
                filter === "all" || v.lang.toLowerCase().startsWith(filter)
              );
            })
            .forEach(function (v) {
              var o = new Option(v.name + " · " + v.lang, v.voiceURI);
              $("voice").add(o);
            });
          if (current) $("voice").value = current;
          $("status").textContent = voices.length
            ? ""
            : "Waiting for browser voices…";
        }
        speechSynthesis.onvoiceschanged = load;
        $("lang").onchange = load;
        ["rate", "pitch", "volume"].forEach(function (id) {
          $(id).oninput = function () {
            $(id + "Out").textContent = $(id).value;
          };
        });
        function speak() {
          var text = $("text").value.trim();
          if (!text) return ($("status").textContent = "Add text first.");
          speechSynthesis.cancel();
          var u = new SpeechSynthesisUtterance(text),
            v = voices.find(function (x) {
              return x.voiceURI === $("voice").value;
            });
          if (v) u.voice = v;
          u.rate = +$("rate").value;
          u.pitch = +$("pitch").value;
          u.volume = +$("volume").value;
          u.onstart = function () {
            $("studio").classList.add("speaking");
            $("status").textContent = "Speaking…";
          };
          u.onend = u.onerror = function () {
            $("studio").classList.remove("speaking");
            $("status").textContent = "Narration finished.";
          };
          speechSynthesis.speak(u);
          paused = false;
        }
        $("play").onclick = speak;
        $("pause").onclick = function () {
          if (speechSynthesis.speaking) {
            if (paused) {
              speechSynthesis.resume();
              $("pause").textContent = "Pause";
            } else {
              speechSynthesis.pause();
              $("pause").textContent = "Resume";
            }
            paused = !paused;
          }
        };
        $("stop").onclick = function () {
          speechSynthesis.cancel();
          $("studio").classList.remove("speaking");
          $("status").textContent = "Stopped.";
        };
        $("clear").onclick = function () {
          $("text").value = "";
          count();
        };
        function count() {
          $("count").textContent =
            $("text").value.length +
            " characters · " +
            ($("text").value.trim()
              ? $("text").value.trim().split(/\s+/).length
              : 0) +
            " words";
        }
        $("text").oninput = count;
        count();
        load();
      })();
