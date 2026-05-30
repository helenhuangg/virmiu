(function () {
  var PLAYLIST_ID = "2odXT4RgSh3UDTHnd8p1ip";
  var STORAGE_KEY = "elise-music-player-expanded";
  var SESSION_TRACK_ID = "elise-music-player-track-id";
  var SESSION_TRACK_INDEX = "elise-music-player-track-index";
  var SESSION_PLAYING = "elise-music-player-playing";
  var SESSION_ACTIVE = "elise-music-player-active";
  var SESSION_POSITION = "elise-music-player-position";
  var embedApiReady = false;
  var embedApiQueue = [];
  var spotifyIFrameAPI = null;
  var globalController = null;
  var lastPlaybackData = null;
  var playlistTracks = [];
  var currentTrackIndex = -1;
  var playlistLoadPromise = null;
  var embedInitialized = false;
  var pendingAutoplay = false;
  var pendingSeekMs = 0;
  var sessionPlaying = false;
  var sessionRestoreStarted = false;

  function readSessionState() {
    try {
      var trackIndex = parseInt(
        sessionStorage.getItem(SESSION_TRACK_INDEX),
        10
      );
      return {
        trackId: sessionStorage.getItem(SESSION_TRACK_ID),
        trackIndex: isNaN(trackIndex) ? -1 : trackIndex,
        playing: sessionStorage.getItem(SESSION_PLAYING) === "1",
        active: sessionStorage.getItem(SESSION_ACTIVE) === "1",
        position: parseInt(sessionStorage.getItem(SESSION_POSITION), 10) || 0,
      };
    } catch (e) {
      return {
        trackId: null,
        trackIndex: -1,
        playing: false,
        active: false,
        position: 0,
      };
    }
  }

  function saveSessionState() {
    try {
      var track =
        currentTrackIndex >= 0 ? playlistTracks[currentTrackIndex] : null;
      if (track) {
        sessionStorage.setItem(SESSION_TRACK_ID, track.id);
        sessionStorage.setItem(SESSION_TRACK_INDEX, String(currentTrackIndex));
      }
      sessionStorage.setItem(SESSION_PLAYING, sessionPlaying ? "1" : "0");
      if (globalController || sessionRestoreStarted) {
        sessionStorage.setItem(SESSION_ACTIVE, "1");
      }
      if (
        lastPlaybackData &&
        lastPlaybackData.position !== undefined &&
        !isNaN(lastPlaybackData.position)
      ) {
        sessionStorage.setItem(
          SESSION_POSITION,
          String(lastPlaybackData.position)
        );
      }
    } catch (e) {}
  }

  function markSessionActive() {
    sessionRestoreStarted = true;
    try {
      sessionStorage.setItem(SESSION_ACTIVE, "1");
    } catch (e) {}
  }

  function resolveSavedTrackIndex(session) {
    if (session.trackId) {
      var byId = indexForTrackId(session.trackId);
      if (byId >= 0) return byId;
    }
    if (
      session.trackIndex >= 0 &&
      session.trackIndex < playlistTracks.length
    ) {
      return session.trackIndex;
    }
    return 0;
  }

  function syncPlayingState(playing) {
    sessionPlaying = !!playing;
    document.querySelectorAll("music-player").forEach(function (el) {
      el.setPlaying(playing);
    });
    saveSessionState();
  }

  function loadPlaylistTracks() {
    if (playlistLoadPromise) return playlistLoadPromise;
    playlistLoadPromise = fetch("assets/playlist-tracks.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        playlistTracks = data.tracks || [];
        return playlistTracks;
      })
      .catch(function () {
        playlistTracks = [];
        return playlistTracks;
      });
    return playlistLoadPromise;
  }

  function trackIdFromUri(uri) {
    if (!uri) return null;
    var match = String(uri).match(/spotify:track:([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  function indexForTrackId(id) {
    for (var i = 0; i < playlistTracks.length; i++) {
      if (playlistTracks[i].id === id) return i;
    }
    return -1;
  }

  function getCurrentTrackIndex() {
    if (currentTrackIndex >= 0) return currentTrackIndex;

    var id = null;
    if (lastPlaybackData) {
      id = trackIdFromUri(lastPlaybackData.playingURI);
      if (
        !id &&
        lastPlaybackData.track_window &&
        lastPlaybackData.track_window.current_track
      ) {
        id = lastPlaybackData.track_window.current_track.id;
      }
    }

    if (id) {
      var idx = indexForTrackId(id);
      if (idx >= 0) currentTrackIndex = idx;
    }

    return currentTrackIndex;
  }

  function resetPlayerProgress() {
    document.querySelectorAll("music-player").forEach(function (el) {
      el.setProgress(0, 1);
    });
  }

  function applyCachedTrack(track, resetProgress) {
    if (!track) return;
    if (resetProgress !== false) resetPlayerProgress();
    document.querySelectorAll("music-player").forEach(function (el) {
      el.setTrack(track.name || "—", track.artist || "—");
      if (track.cover) el.setCover(track.cover);
      el.lastTrackId = track.id;
    });
  }

  function stylePlaybackIframe(iframe) {
    if (!iframe) return;
    iframe.setAttribute("tabindex", "-1");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute!important;left:0!important;top:0!important;width:300px!important;height:80px!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;border:0!important;";
  }

  function mountController(uri, autoplay, done) {
    if (globalController) {
      try {
        globalController.destroy();
      } catch (e) {}
      globalController = null;
    }

    embedInitialized = false;
    pendingAutoplay = !!autoplay;

    whenEmbedApiReady(function (IFrameAPI) {
      var sink = getPlaybackSink();
      sink.textContent = "";

      IFrameAPI.createController(
        sink,
        { uri: uri, width: 300, height: 80 },
        function (controller) {
          globalController = controller;
          stylePlaybackIframe(sink.querySelector("iframe"));
          new MutationObserver(function () {
            stylePlaybackIframe(sink.querySelector("iframe"));
          }).observe(sink, { childList: true, subtree: true });
          attachListeners(controller);
          if (done) done(controller);
        }
      );
    });
  }

  function playTrackAtIndex(index, autoplay, done) {
    if (!playlistTracks.length) return;

    if (index < 0) index = playlistTracks.length - 1;
    if (index >= playlistTracks.length) index = 0;

    currentTrackIndex = index;
    var track = playlistTracks[index];
    applyCachedTrack(track, true);
    markSessionActive();
    saveSessionState();
    mountController("spotify:track:" + track.id, autoplay !== false, done);
  }

  function skipTrack(delta, done) {
    var index = getCurrentTrackIndex();
    if (index < 0) index = 0;
    playTrackAtIndex(index + delta, true, done);
  }

  function syncTrackFromPlayback(data) {
    if (!data) return;

    var id = trackIdFromUri(data.playingURI);
    if (!id && data.track_window && data.track_window.current_track) {
      id = data.track_window.current_track.id;
    }

    if (id) {
      var idx = indexForTrackId(id);
      if (idx >= 0) currentTrackIndex = idx;
      saveSessionState();
    }
  }

  window.onSpotifyIframeApiReady = function (IFrameAPI) {
    spotifyIFrameAPI = IFrameAPI;
    embedApiReady = true;
    embedApiQueue.forEach(function (fn) {
      fn(IFrameAPI);
    });
    embedApiQueue = [];
  };

  function whenEmbedApiReady(fn) {
    if (embedApiReady && spotifyIFrameAPI) {
      fn(spotifyIFrameAPI);
      return;
    }
    embedApiQueue.push(fn);
  }

  function getPlaybackSink() {
    var sink = document.getElementById("spotify-playback-sink");
    if (sink) return sink;

    sink = document.createElement("div");
    sink.id = "spotify-playback-sink";
    sink.setAttribute("aria-hidden", "true");
    document.body.appendChild(sink);
    return sink;
  }

  function quarantineIframe(iframe) {
    if (!iframe || !iframe.src || iframe.src.indexOf("spotify") === -1) return;

    var sink = getPlaybackSink();
    if (iframe.parentNode !== sink) {
      sink.appendChild(iframe);
    }

    stylePlaybackIframe(iframe);
  }

  function watchStrayIframes() {
    if (document.body.dataset.spotifyWatch) return;
    document.body.dataset.spotifyWatch = "1";

    function scan() {
      document.querySelectorAll("iframe").forEach(quarantineIframe);
    }

    scan();
    new MutationObserver(scan).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function attachListeners(controller) {
    controller.addListener("ready", function () {
      if (embedInitialized) return;
      embedInitialized = true;
      if (pendingAutoplay) {
        pendingAutoplay = false;
        controller.play();
        if (pendingSeekMs > 0) {
          var seekTo = pendingSeekMs;
          pendingSeekMs = 0;
          window.setTimeout(function () {
            try {
              controller.seek(Math.floor(seekTo / 1000));
            } catch (e) {}
          }, 200);
        }
      } else {
        controller.pause();
      }
    });

    controller.addListener("playback_update", function (e) {
      lastPlaybackData = e.data;
      syncTrackFromPlayback(e.data);
      var paused =
        e.data.is_paused !== undefined ? e.data.is_paused : e.data.isPaused;
      if (paused !== undefined) {
        sessionPlaying = !paused;
        saveSessionState();
      }
      document.querySelectorAll("music-player").forEach(function (el) {
        el.updateTrack(e.data);
      });
    });

    controller.addListener("playback_started", function (e) {
      if (!e.data) return;
      pendingAutoplay = false;
      sessionPlaying = true;
      syncTrackFromPlayback({ playingURI: e.data.playingURI });
      var id = trackIdFromUri(e.data.playingURI);
      if (id) {
        var idx = indexForTrackId(id);
        if (idx >= 0 && playlistTracks[idx]) {
          applyCachedTrack(playlistTracks[idx], false);
        }
      }
      saveSessionState();
    });
  }

  function ensureController(onReady) {
    if (globalController) {
      onReady(globalController);
      if (lastPlaybackData) {
        document.querySelectorAll("music-player").forEach(function (el) {
          el.updateTrack(lastPlaybackData);
        });
      }
      return;
    }

    var session = readSessionState();
    if (session.active) {
      loadPlaylistTracks().then(function () {
        var index = resolveSavedTrackIndex(session);
        currentTrackIndex = index;
        var track = playlistTracks[index];
        if (track) {
          applyCachedTrack(track, false);
          mountController(
            "spotify:track:" + track.id,
            session.playing,
            onReady
          );
          if (session.playing && session.position > 0) {
            pendingSeekMs = session.position;
          }
          syncPlayingState(session.playing);
          return;
        }
        mountController("spotify:playlist:" + PLAYLIST_ID, false, onReady);
      });
      return;
    }

    mountController("spotify:playlist:" + PLAYLIST_ID, false, onReady);
  }

  function loadEmbedScript() {
    if (document.querySelector('script[data-spotify-embed-api]')) return;
    var s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.setAttribute("data-spotify-embed-api", "1");
    document.head.appendChild(s);
  }

  function trackCoverUrl(track) {
    if (!track) return "";
    var images = track.album && track.album.images;
    if (images && images.length) {
      return images[images.length - 1].url || images[0].url || "";
    }
    return track.image || "";
  }

  function restorePlayerSession() {
    loadPlaylistTracks().then(function (tracks) {
      if (!tracks.length) return;

      var session = readSessionState();
      var index = resolveSavedTrackIndex(session);
      currentTrackIndex = index;
      applyCachedTrack(tracks[index], false);

      if (session.position > 0) {
        document.querySelectorAll("music-player").forEach(function (el) {
          el.setProgress(session.position, 1);
        });
      }

      if (session.active) {
        sessionRestoreStarted = true;
        loadEmbedScript();
        ensureController(function (c) {
          document.querySelectorAll("music-player").forEach(function (el) {
            el.controller = c;
            el.embedRequested = true;
          });
        });
        syncPlayingState(session.playing);
      }
    });
  }

  window.addEventListener("pagehide", saveSessionState);
  window.addEventListener("beforeunload", saveSessionState);

  function isInternalPageLink(link) {
    if (!link || link.target === "_blank") return false;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0) {
      return false;
    }
    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      var page = url.pathname.split("/").pop() || "index.html";
      return (
        page === "index.html" ||
        page === "about.html" ||
        page === "commission.html"
      );
    } catch (e) {
      return false;
    }
  }

  var softNavigating = false;

  function softNavigate(url, replaceState) {
    if (softNavigating) return;
    softNavigating = true;

    fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error("Navigation fetch failed");
        return response.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var newMain = doc.querySelector("main");
        var oldMain = document.querySelector("main");

        if (!newMain || !oldMain) throw new Error("Missing main element");

        oldMain.replaceWith(document.importNode(newMain, true));
        document.title = doc.title;

        if (replaceState) {
          history.replaceState({ eliseSoft: true }, "", url);
        } else {
          history.pushState({ eliseSoft: true }, "", url);
        }

        if (window.refreshSiteHeader) {
          window.refreshSiteHeader();
        }

        saveSessionState();

        if (window.initElisePage) {
          window.initElisePage();
        }
      })
      .catch(function () {
        window.location.href = url;
      })
      .finally(function () {
        softNavigating = false;
      });
  }

  function initSoftNavigation() {
    if (document.body.dataset.eliseSoftNav) return;
    document.body.dataset.eliseSoftNav = "1";

    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (link && isInternalPageLink(link)) {
        e.preventDefault();
        softNavigate(link.href);
        return;
      }

      var player = document.querySelector("music-player");
      if (
        player &&
        player.classList.contains("is-expanded") &&
        !player.contains(e.target)
      ) {
        player.setExpanded(false);
      }
    });

    window.addEventListener("popstate", function () {
      softNavigate(window.location.href, true);
    });
  }

  var IMG_PREV =
    '<img class="music-player__icon" src="assets/previous.svg" alt="" width="14" height="10" />';
  var IMG_PLAY =
    '<img class="music-player__icon music-player__icon-play" src="assets/play.svg" alt="" width="10" height="10" />';
  var IMG_PAUSE =
    '<img class="music-player__icon music-player__icon-pause" src="assets/player-pause.svg" alt="" width="8" height="10" hidden />';
  var IMG_NEXT =
    '<img class="music-player__icon" src="assets/next.svg" alt="" width="14" height="10" />';

  class MusicPlayer extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "1";

      this.innerHTML =
        '<div class="music-player__bar">' +
        '<img class="music-player__logo" src="assets/key.png" alt="" width="10" height="18" />' +
        '<div class="music-player__main">' +
        '<div class="music-player__info">' +
        '<button type="button" class="music-player__cover" aria-label="Open music player"></button>' +
        '<div class="music-player__meta">' +
        '<p class="music-player__title">—</p>' +
        '<p class="music-player__artist">—</p>' +
        "</div>" +
        "</div>" +
        '<div class="music-player__progress" aria-hidden="true">' +
        '<div class="music-player__progress-fill"></div>' +
        "</div>" +
        '<div class="music-player__controls">' +
        '<button type="button" class="music-player__btn music-player__btn--prev" aria-label="Previous track">' +
        IMG_PREV +
        "</button>" +
        '<button type="button" class="music-player__btn music-player__btn--play" aria-label="Play">' +
        IMG_PLAY +
        IMG_PAUSE +
        "</button>" +
        '<button type="button" class="music-player__btn music-player__btn--next" aria-label="Next track">' +
        IMG_NEXT +
        "</button>" +
        "</div>" +
        "</div>" +
        "</div>";

      this.coverEl = this.querySelector(".music-player__cover");
      this.progressFill = this.querySelector(".music-player__progress-fill");
      this.titleEl = this.querySelector(".music-player__title");
      this.artistEl = this.querySelector(".music-player__artist");
      this.btnPrev = this.querySelector(".music-player__btn--prev");
      this.btnPlay = this.querySelector(".music-player__btn--play");
      this.btnNext = this.querySelector(".music-player__btn--next");
      this.iconPlay = this.querySelector(".music-player__icon-play");
      this.iconPause = this.querySelector(".music-player__icon-pause");

      this.controller = null;
      this.embedRequested = false;
      this.lastTrackId = null;

      this.btnPrev.addEventListener("click", this.onPrev.bind(this));
      this.btnPlay.addEventListener("click", this.onPlay.bind(this));
      this.btnNext.addEventListener("click", this.onNext.bind(this));

      var self = this;
      var storedExpanded = false;
      try {
        storedExpanded = localStorage.getItem(STORAGE_KEY) === "1";
      } catch (e) {}
      this.setExpanded(storedExpanded, false);

      this.coverEl.addEventListener("click", function (e) {
        if (!self.classList.contains("is-expanded")) {
          e.stopPropagation();
          self.setExpanded(true);
        }
      });

      this.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    setExpanded(expanded, persist) {
      this.classList.toggle("is-expanded", expanded);
      this.coverEl.setAttribute(
        "aria-label",
        expanded ? "Album cover" : "Open music player"
      );
      if (persist === false) return;
      try {
        localStorage.setItem(STORAGE_KEY, expanded ? "1" : "0");
      } catch (e) {}
    }

    prepareEmbed(cb) {
      if (!this.embedRequested) {
        this.embedRequested = true;
        loadEmbedScript();
      }
      ensureController(cb || function () {});
    }

    onPrev() {
      var self = this;
      markSessionActive();
      this.prepareEmbed(function () {
        loadPlaylistTracks().then(function () {
          skipTrack(-1, function (c) {
            self.controller = c;
            saveSessionState();
          });
        });
      });
    }

    onNext() {
      var self = this;
      markSessionActive();
      this.prepareEmbed(function () {
        loadPlaylistTracks().then(function () {
          skipTrack(1, function (c) {
            self.controller = c;
            saveSessionState();
          });
        });
      });
    }

    onPlay() {
      var self = this;
      markSessionActive();
      this.prepareEmbed(function (c) {
        self.controller = c;
        c.togglePlay();
        saveSessionState();
      });
    }

    setCover(url) {
      if (!this.coverEl) return;
      if (url) {
        this.coverEl.style.backgroundImage = 'url("' + url + '")';
      } else {
        this.coverEl.style.backgroundImage = "";
      }
    }

    setTrack(title, artist) {
      this.titleEl.textContent = title || "—";
      this.artistEl.textContent = artist || "—";
    }

    setPlaying(playing) {
      this.classList.toggle("is-playing", playing);
      this.btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
      if (this.iconPlay) this.iconPlay.hidden = playing;
      if (this.iconPause) this.iconPause.hidden = !playing;
    }

    setProgress(position, duration) {
      if (!this.progressFill) return;
      var pct = 0;
      if (duration && duration > 0) {
        pct = Math.min(100, Math.max(0, (position / duration) * 100));
      }
      this.progressFill.style.width = pct + "%";
    }

    updateTrack(data) {
      if (!data) return;

      var id = trackIdFromUri(data.playingURI);
      if (
        !id &&
        data.track_window &&
        data.track_window.current_track
      ) {
        id = data.track_window.current_track.id;
      }

      if (id && id !== this.lastTrackId) {
        this.lastTrackId = id;
        this.setProgress(0, 1);
      }

      if (data.position !== undefined && data.duration !== undefined) {
        this.setProgress(data.position, data.duration);
      }

      if (data.track_window && data.track_window.current_track) {
        var legacyTrack = data.track_window.current_track;
        this.setTrack(
          legacyTrack.name,
          (legacyTrack.artists || [])
            .map(function (a) {
              return a.name;
            })
            .join(", ")
        );
        this.setCover(trackCoverUrl(legacyTrack));
      } else if (id) {
        var idx = indexForTrackId(id);
        if (idx >= 0 && playlistTracks[idx]) {
          var cached = playlistTracks[idx];
          this.setTrack(cached.name || "—", cached.artist || "—");
          if (cached.cover) this.setCover(cached.cover);
        }
      }

      var paused =
        data.is_paused !== undefined ? data.is_paused : data.isPaused;
      if (paused !== undefined) {
        sessionPlaying = !paused;
        saveSessionState();
        this.setPlaying(!paused);
      }
    }
  }

  customElements.define("music-player", MusicPlayer);

  var playerBootstrapped = false;

  function ensureMusicPlayer() {
    if (!document.querySelector("music-player")) {
      document.body.appendChild(document.createElement("music-player"));
    }
    if (!playerBootstrapped) {
      playerBootstrapped = true;
      initSoftNavigation();
      restorePlayerSession();
      watchStrayIframes();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureMusicPlayer);
  } else {
    ensureMusicPlayer();
  }
})();
