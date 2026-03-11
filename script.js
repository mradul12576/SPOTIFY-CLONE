const defaultSongs = [
  {
    title: "Tum Se Hi",
    artist: "Pritam",
    file: "Tum Se Hi.mp3",
    cover: "art.jpg",
    isDefault: true
  },
  {
    title: "Phir Bhi Tumko Chahunga",
    artist: "Arijit Singh",
    file: "Phir Bhi Tumko Chaahunga.mp3",
    cover: "phir.jpeg",
    isDefault: true
  },
  {
    title: "Ranjhaa",
    artist: "A.R. Rahman",
    file: "Raanjhanaa.mp3",
    cover: "Ranj.jpg",
    isDefault: true
  },
  {
    title: "Why This Kolaveri",
    artist: "Anirudh Ravichander",
    file: "why.mp3",
    cover: "kolaveri.jpg",
    isDefault: true
  }
];

let songs = [...defaultSongs];

const audioPlayer = document.getElementById("audioPlayer");
const songList = document.getElementById("songList");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const seekBar = document.getElementById("seekBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeBar = document.getElementById("volumeBar");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const muteBtn = document.getElementById("muteBtn");

const nowPlayingTitle = document.getElementById("nowPlayingTitle");
const nowPlayingArtist = document.getElementById("nowPlayingArtist");

const homeBtn = document.getElementById("homeBtn");
const searchBtn = document.getElementById("searchBtn");
const searchBox = document.getElementById("searchBox");
const searchInput = document.getElementById("searchInput");
const homeSection = document.getElementById("homeSection");
const searchSection = document.getElementById("searchSection");
const searchResults = document.getElementById("searchResults");

const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const playlistList = document.getElementById("playlistList");
const songsTitle = document.querySelector(".songs-title");

const uploadSongBtn = document.getElementById("uploadSongBtn");
const songUploader = document.getElementById("songUploader");

const authScreen = document.getElementById("authScreen");
const appContainer = document.getElementById("appContainer");

const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authMobile = document.getElementById("authMobile");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const authPhoto = document.getElementById("authPhoto");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

const profileImage = document.getElementById("profileImage");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileMobile = document.getElementById("profileMobile");

let currentSongIndex = 0;
let isShuffle = false;
let isRepeat = false;
let lastVolume = 1;
let currentPlaylistView = null;

/* ---------------- HELPERS ---------------- */

function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function setSongsTitle(text) {
  if (songsTitle) songsTitle.textContent = text;
}

function getUsers() {
  return JSON.parse(localStorage.getItem("spotifyCloneUsers")) || [];
}

function saveUsers(users) {
  localStorage.setItem("spotifyCloneUsers", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("spotifyCloneCurrentUser")) || null;
}

function setCurrentUser(user) {
  localStorage.setItem("spotifyCloneCurrentUser", JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem("spotifyCloneCurrentUser");
}

function getFullCurrentUser() {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const users = getUsers();
  return users.find((user) => user.username === currentUser.username) || null;
}

function getCurrentUsername() {
  const currentUser = getCurrentUser();
  return currentUser ? currentUser.username : null;
}

function getUserStorageKey(type) {
  const username = getCurrentUsername();
  if (!username) return null;
  return `spotifyClone_${type}_${username}`;
}

/* ---------------- POPUP ---------------- */

function createPopup() {
  if (document.getElementById("appPopupOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "appPopupOverlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 20px;
  `;

  const modal = document.createElement("div");
  modal.id = "appPopupModal";
  modal.style.cssText = `
    width: 100%;
    max-width: 390px;
    background: #181818;
    color: white;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.45);
  `;

  modal.innerHTML = `
    <h3 id="popupTitle" style="margin:0 0 8px 0;">Popup</h3>
    <p id="popupText" style="margin:0 0 16px 0; color:#b3b3b3; font-size:14px;"></p>

    <div id="popupInputWrap" style="display:none; margin-bottom:14px;">
      <input
        id="popupInput"
        type="text"
        placeholder=""
        style="
          width:100%;
          padding:12px;
          border:none;
          outline:none;
          border-radius:10px;
          background:#2a2a2a;
          color:white;
          font-size:14px;
        "
      />
    </div>

    <div id="popupButtons" style="display:flex; flex-direction:column; gap:10px;"></div>

    <button
      id="popupCloseBtn"
      style="
        margin-top:14px;
        width:100%;
        padding:11px 12px;
        border:none;
        border-radius:999px;
        background:#2a2a2a;
        color:white;
        cursor:pointer;
      "
    >
      Close
    </button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePopup();
  });

  document.getElementById("popupCloseBtn").addEventListener("click", closePopup);
}

function closePopup() {
  const overlay = document.getElementById("appPopupOverlay");
  if (overlay) overlay.style.display = "none";
}

function showPopup({
  title = "Popup",
  text = "",
  showInput = false,
  inputPlaceholder = "",
  inputValue = "",
  buttons = []
}) {
  createPopup();

  const overlay = document.getElementById("appPopupOverlay");
  const titleEl = document.getElementById("popupTitle");
  const textEl = document.getElementById("popupText");
  const inputWrap = document.getElementById("popupInputWrap");
  const inputEl = document.getElementById("popupInput");
  const buttonsWrap = document.getElementById("popupButtons");

  if (!overlay || !titleEl || !textEl || !inputWrap || !inputEl || !buttonsWrap) return;

  titleEl.textContent = title;
  textEl.textContent = text;
  buttonsWrap.innerHTML = "";

  if (showInput) {
    inputWrap.style.display = "block";
    inputEl.placeholder = inputPlaceholder;
    inputEl.value = inputValue;
    setTimeout(() => inputEl.focus(), 0);
  } else {
    inputWrap.style.display = "none";
    inputEl.value = "";
    inputEl.placeholder = "";
  }

  buttons.forEach((btn) => {
    const button = document.createElement("button");
    button.textContent = btn.label;
    button.style.cssText = `
      width: 100%;
      padding: 11px 12px;
      border: none;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
      background: ${btn.variant === "danger" ? "#ff4d4d" : btn.variant === "secondary" ? "#2a2a2a" : "#1db954"};
      color: ${btn.variant === "danger" ? "white" : btn.variant === "secondary" ? "white" : "black"};
    `;

    button.addEventListener("click", () => {
      btn.onClick?.(inputEl.value.trim());
    });

    buttonsWrap.appendChild(button);
  });

  if (showInput) {
    inputEl.onkeydown = (e) => {
      if (e.key === "Enter" && buttons[0]?.onClick) {
        buttons[0].onClick(inputEl.value.trim());
      }
    };
  } else {
    inputEl.onkeydown = null;
  }

  overlay.style.display = "flex";
}

function showMessagePopup(title, text) {
  showPopup({
    title,
    text,
    buttons: [
      {
        label: "OK",
        onClick: () => closePopup()
      }
    ]
  });
}

function openCreatePlaylistPopup() {
  showPopup({
    title: "Create Playlist",
    text: "Enter playlist name",
    showInput: true,
    inputPlaceholder: "Playlist name",
    buttons: [
      {
        label: "Create Playlist",
        onClick: (value) => {
          const cleanName = value.trim();

          if (!cleanName) {
            showMessagePopup("Missing Name", "Please enter playlist name.");
            return;
          }

          const currentUser = getCurrentUser();
          if (!currentUser) {
            showMessagePopup("Login Required", "Please login first.");
            return;
          }

          const playlistsData = getUserPlaylistsData();

          if (playlistsData[cleanName]) {
            showMessagePopup("Already Exists", "Playlist already exists.");
            return;
          }

          playlistsData[cleanName] = [];
          saveUserPlaylistsData(playlistsData);
          renderPlaylists();
          closePopup();
        }
      }
    ]
  });
}

function openArtistPopup(file, onDone) {
  const cleanName = file.name.replace(/\.[^/.]+$/, "");

  showPopup({
    title: "Song Details",
    text: `Artist name for "${cleanName}"`,
    showInput: true,
    inputPlaceholder: "Artist name",
    inputValue: "Unknown Artist",
    buttons: [
      {
        label: "Save Song",
        onClick: (value) => {
          const artistName = value || "Unknown Artist";
          closePopup();
          onDone(artistName);
        }
      }
    ]
  });
}

function openAddToPlaylistPopup(song) {
  const playlistNames = getPlaylistNames();

  if (playlistNames.length === 0) {
    showMessagePopup("No Playlist", "Please create a playlist first.");
    return;
  }

  showPopup({
    title: "Add to Playlist",
    text: `Choose playlist for "${song.title}"`,
    buttons: playlistNames.map((playlistName) => ({
      label: playlistName,
      onClick: () => {
        addSongToPlaylist(playlistName, song.file);
        closePopup();
      }
    }))
  });
}

/* ---------------- USER DATA ---------------- */

function saveUserSongs() {
  const key = getUserStorageKey("songs");
  if (!key) return;

  const uploadedSongs = songs.filter((song) => !song.isDefault);
  localStorage.setItem(key, JSON.stringify(uploadedSongs));
}

function loadUserSongs() {
  songs = [...defaultSongs];

  const key = getUserStorageKey("songs");
  if (!key) return;

  const userSongs = JSON.parse(localStorage.getItem(key)) || [];
  songs = [...defaultSongs, ...userSongs];
}

function saveUserPlaylistsData(playlistsData) {
  const key = getUserStorageKey("playlistsData");
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(playlistsData));
}

function getUserPlaylistsData() {
  const key = getUserStorageKey("playlistsData");
  if (!key) return {};
  return JSON.parse(localStorage.getItem(key)) || {};
}

function getPlaylistNames() {
  return Object.keys(getUserPlaylistsData());
}

/* ---------------- PLAYER ---------------- */

function updatePlayButton(isPlaying) {
  if (!playPauseBtn) return;

  playPauseBtn.innerHTML = isPlaying
    ? `<span class="material-symbols-outlined">pause</span>`
    : `<span class="material-symbols-outlined">play_arrow</span>`;
}

function updateSongListUI() {
  if (!songList) return;

  [...songList.children].forEach((li) => {
    const index = Number(li.dataset.index);
    if (!Number.isNaN(index)) {
      li.classList.toggle("active-song", index === currentSongIndex);
    }
  });
}

function updateNowPlaying() {
  const song = songs[currentSongIndex];
  if (!song) {
    if (nowPlayingTitle) nowPlayingTitle.textContent = "No song selected";
    if (nowPlayingArtist) nowPlayingArtist.textContent = "-";
    return;
  }

  if (nowPlayingTitle) nowPlayingTitle.textContent = song.title;
  if (nowPlayingArtist) nowPlayingArtist.textContent = song.artist;
}

function loadSong(index) {
  if (!audioPlayer) return;
  if (index < 0 || index >= songs.length) return;

  currentSongIndex = index;
  const song = songs[index];
  audioPlayer.src = song.file;
  updateSongListUI();
  updateNowPlaying();
}

function playSong(index = currentSongIndex) {
  if (!audioPlayer) return;
  loadSong(index);
  audioPlayer.play()
    .then(() => updatePlayButton(true))
    .catch((err) => console.log("Playback error:", err));
}

function playPauseSong() {
  if (!audioPlayer) return;

  if (!audioPlayer.src) {
    playSong(currentSongIndex);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play()
      .then(() => updatePlayButton(true))
      .catch((err) => console.log("Playback error:", err));
  } else {
    audioPlayer.pause();
    updatePlayButton(false);
  }
}

function playNextSong() {
  if (songs.length === 0) return;

  if (isShuffle) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (songs.length > 1 && randomIndex === currentSongIndex);
    currentSongIndex = randomIndex;
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }

  playSong(currentSongIndex);
}

function playPrevSong() {
  if (songs.length === 0) return;

  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong(currentSongIndex);
}

/* ---------------- SONG / PLAYLIST ACTIONS ---------------- */

function addSongToPlaylist(playlistName, songFile) {
  const playlistsData = getUserPlaylistsData();

  if (!playlistsData[playlistName]) {
    showMessagePopup("Not Found", "Playlist not found.");
    return;
  }

  if (playlistsData[playlistName].includes(songFile)) {
    showMessagePopup("Already Added", "Song already exists in this playlist.");
    return;
  }

  playlistsData[playlistName].push(songFile);
  saveUserPlaylistsData(playlistsData);
  showMessagePopup("Added", `Song added to "${playlistName}"`);
}

function showPlaylistSongs(playlistName) {
  currentPlaylistView = playlistName;
  setSongsTitle(`${playlistName} Playlist`);

  const playlistsData = getUserPlaylistsData();
  const playlistSongFiles = playlistsData[playlistName] || [];

  const playlistSongs = songs.filter((song) => playlistSongFiles.includes(song.file));
  renderSongs(playlistSongs);
}

function removeSongFromPlaylist(playlistName, songFile) {
  const playlistsData = getUserPlaylistsData();

  if (!playlistsData[playlistName]) return;

  playlistsData[playlistName] = playlistsData[playlistName].filter(
    (file) => file !== songFile
  );

  saveUserPlaylistsData(playlistsData);
  showPlaylistSongs(playlistName);
}

function deleteSong(songIndex) {
  const songToDelete = songs[songIndex];
  if (!songToDelete) return;

  if (songToDelete.isDefault) {
    showMessagePopup("Not Allowed", "Default songs can't be deleted.");
    return;
  }

  const fileToDelete = songToDelete.file;
  const wasCurrentSong = currentSongIndex === songIndex;

  songs.splice(songIndex, 1);
  saveUserSongs();

  const playlistsData = getUserPlaylistsData();
  Object.keys(playlistsData).forEach((playlistName) => {
    playlistsData[playlistName] = playlistsData[playlistName].filter(
      (file) => file !== fileToDelete
    );
  });
  saveUserPlaylistsData(playlistsData);

  if (songs.length === 0) {
    currentSongIndex = 0;
  } else if (songIndex < currentSongIndex) {
    currentSongIndex -= 1;
  } else if (currentSongIndex >= songs.length) {
    currentSongIndex = songs.length - 1;
  }

  renderPlaylists();

  if (currentPlaylistView) {
    showPlaylistSongs(currentPlaylistView);
  } else {
    renderSongs(songs);
  }

  if (searchInput && searchInput.value.trim()) {
    handleSearch();
  }

  if (songs.length > 0) {
    if (wasCurrentSong) {
      loadSong(currentSongIndex);
    } else {
      updateSongListUI();
      updateNowPlaying();
    }
  } else {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.removeAttribute("src");
    }
    if (nowPlayingTitle) nowPlayingTitle.textContent = "No song selected";
    if (nowPlayingArtist) nowPlayingArtist.textContent = "-";
    updatePlayButton(false);
  }
}

function deletePlaylist(playlistName) {
  const playlistsData = getUserPlaylistsData();
  delete playlistsData[playlistName];
  saveUserPlaylistsData(playlistsData);

  if (currentPlaylistView === playlistName) {
    currentPlaylistView = null;
    setSongsTitle("All Songs");
    renderSongs(songs);
  }

  renderPlaylists();
}

/* ---------------- SONG RENDER ---------------- */

function renderSongs(list = songs) {
  if (!songList) return;

  songList.innerHTML = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No songs found";
    li.style.opacity = "0.7";
    li.style.cursor = "default";
    songList.appendChild(li);
    return;
  }

  list.forEach((song) => {
    const originalIndex = songs.findIndex((s) => s.file === song.file);

    const li = document.createElement("li");
    li.dataset.index = originalIndex;
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.justifyContent = "space-between";
    li.style.gap = "10px";

    const songText = document.createElement("span");
    songText.textContent = `${song.title} - ${song.artist}`;
    songText.style.flex = "1";
    songText.style.cursor = "pointer";

    songText.addEventListener("click", () => {
      playSong(originalIndex);
    });

    li.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      if (currentPlaylistView) {
        showPopup({
          title: song.title,
          text: "Choose an action",
          buttons: [
            {
              label: "Remove from Playlist",
              variant: "danger",
              onClick: () => {
                removeSongFromPlaylist(currentPlaylistView, song.file);
                closePopup();
              }
            }
          ]
        });
        return;
      }

      if (song.isDefault) {
        openAddToPlaylistPopup(song);
        return;
      }

      showPopup({
        title: song.title,
        text: "Choose an action",
        buttons: [
          {
            label: "Add to Playlist",
            onClick: () => {
              openAddToPlaylistPopup(song);
            }
          },
          {
            label: "Delete Song",
            variant: "danger",
            onClick: () => {
              deleteSong(originalIndex);
              closePopup();
            }
          }
        ]
      });
    });

    li.appendChild(songText);

    const actionBtn = document.createElement("button");
    actionBtn.style.border = "none";
    actionBtn.style.background = "transparent";
    actionBtn.style.color = "white";
    actionBtn.style.cursor = "pointer";
    actionBtn.style.display = "flex";
    actionBtn.style.alignItems = "center";
    actionBtn.style.justifyContent = "center";

    if (currentPlaylistView) {
      actionBtn.innerHTML = `<span class="material-symbols-outlined">remove_circle</span>`;
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        showPopup({
          title: "Remove Song",
          text: `Remove "${song.title}" from "${currentPlaylistView}"?`,
          buttons: [
            {
              label: "Remove",
              variant: "danger",
              onClick: () => {
                removeSongFromPlaylist(currentPlaylistView, song.file);
                closePopup();
              }
            }
          ]
        });
      });
    } else if (song.isDefault) {
      actionBtn.innerHTML = `<span class="material-symbols-outlined">playlist_add</span>`;
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openAddToPlaylistPopup(song);
      });
    } else {
      actionBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        showPopup({
          title: "Delete Song",
          text: `Do you want to delete "${song.title}"?`,
          buttons: [
            {
              label: "Delete",
              variant: "danger",
              onClick: () => {
                deleteSong(originalIndex);
                closePopup();
              }
            }
          ]
        });
      });
    }

    li.appendChild(actionBtn);
    songList.appendChild(li);
  });

  updateSongListUI();
}

function renderSearchResults(filteredSongs) {
  if (!searchResults) return;

  searchResults.innerHTML = "";

  if (filteredSongs.length === 0) {
    searchResults.innerHTML = `<p>No songs found.</p>`;
    return;
  }

  filteredSongs.forEach((song) => {
    const originalIndex = songs.findIndex((s) => s.file === song.file);

    const card = document.createElement("div");
    card.className = "artists";
    card.style.position = "relative";

    card.innerHTML = `
      <img src="${song.cover}" alt="${song.title}">
      <h4>${song.title}</h4>
      <span class="span">${song.artist}</span>
      <div class="play">
        <span class="material-symbols-outlined playbutton">play_arrow</span>
      </div>
    `;

    card.addEventListener("click", () => {
      playSong(originalIndex);
    });

    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      if (song.isDefault) {
        openAddToPlaylistPopup(song);
        return;
      }

      showPopup({
        title: song.title,
        text: "Choose an action",
        buttons: [
          {
            label: "Add to Playlist",
            onClick: () => {
              openAddToPlaylistPopup(song);
            }
          },
          {
            label: "Delete Song",
            variant: "danger",
            onClick: () => {
              deleteSong(originalIndex);
              closePopup();
              handleSearch();
            }
          }
        ]
      });
    });

    const actionBtn = document.createElement("button");
    actionBtn.style.position = "absolute";
    actionBtn.style.top = "10px";
    actionBtn.style.right = "10px";
    actionBtn.style.width = "36px";
    actionBtn.style.height = "36px";
    actionBtn.style.border = "none";
    actionBtn.style.borderRadius = "50%";
    actionBtn.style.background = "rgba(0,0,0,0.65)";
    actionBtn.style.color = "white";
    actionBtn.style.cursor = "pointer";
    actionBtn.style.display = "flex";
    actionBtn.style.alignItems = "center";
    actionBtn.style.justifyContent = "center";

    if (song.isDefault) {
      actionBtn.innerHTML = `<span class="material-symbols-outlined">playlist_add</span>`;
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openAddToPlaylistPopup(song);
      });
    } else {
      actionBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        showPopup({
          title: "Delete Song",
          text: `Do you want to delete "${song.title}"?`,
          buttons: [
            {
              label: "Delete",
              variant: "danger",
              onClick: () => {
                deleteSong(originalIndex);
                closePopup();
                handleSearch();
              }
            }
          ]
        });
      });
    }

    card.appendChild(actionBtn);
    searchResults.appendChild(card);
  });
}

/* ---------------- NAV ---------------- */

function showHome() {
  currentPlaylistView = null;
  setSongsTitle("All Songs");

  if (homeBtn) homeBtn.classList.add("active");
  if (searchBtn) searchBtn.classList.remove("active");
  if (homeSection) homeSection.classList.remove("hidden");
  if (searchSection) searchSection.classList.add("hidden");
  if (searchBox) searchBox.classList.remove("show");
  if (searchInput) searchInput.value = "";
  if (searchResults) searchResults.innerHTML = "";

  renderSongs(songs);
}

function showSearch() {
  if (searchBtn) searchBtn.classList.add("active");
  if (homeBtn) homeBtn.classList.remove("active");
  if (homeSection) homeSection.classList.add("hidden");
  if (searchSection) searchSection.classList.remove("hidden");
  if (searchBox) searchBox.classList.add("show");
  if (searchInput) searchInput.focus();
}

function handleSearch() {
  if (!searchInput) return;

  const value = searchInput.value.trim().toLowerCase();

  const filteredSongs = songs.filter((song) => {
    return (
      song.title.toLowerCase().includes(value) ||
      song.artist.toLowerCase().includes(value)
    );
  });

  renderSongs(filteredSongs);
  renderSearchResults(filteredSongs);
}

/* ---------------- PLAYLISTS ---------------- */

function renderPlaylists() {
  if (!playlistList) return;

  const playlistNames = getPlaylistNames();
  playlistList.innerHTML = "";

  if (playlistNames.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No playlist yet";
    li.style.opacity = "0.7";
    li.style.cursor = "default";
    playlistList.appendChild(li);
    return;
  }

  playlistNames.forEach((playlistName) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.justifyContent = "space-between";
    li.style.gap = "10px";

    const text = document.createElement("span");
    text.textContent = playlistName;
    text.style.flex = "1";
    text.style.cursor = "pointer";

    text.addEventListener("click", () => {
      showPlaylistSongs(playlistName);
    });

    li.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      showPopup({
        title: playlistName,
        text: "Choose an action",
        buttons: [
          {
            label: "Open Playlist",
            onClick: () => {
              showPlaylistSongs(playlistName);
              closePopup();
            }
          },
          {
            label: "Delete Playlist",
            variant: "danger",
            onClick: () => {
              deletePlaylist(playlistName);
              closePopup();
            }
          }
        ]
      });
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
    deleteBtn.style.border = "none";
    deleteBtn.style.background = "transparent";
    deleteBtn.style.color = "white";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.display = "flex";
    deleteBtn.style.alignItems = "center";
    deleteBtn.style.justifyContent = "center";

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      showPopup({
        title: "Delete Playlist",
        text: `Do you want to delete "${playlistName}"?`,
        buttons: [
          {
            label: "Delete",
            variant: "danger",
            onClick: () => {
              deletePlaylist(playlistName);
              closePopup();
            }
          }
        ]
      });
    });

    li.appendChild(text);
    li.appendChild(deleteBtn);
    playlistList.appendChild(li);
  });
}

function createPlaylist() {
  openCreatePlaylistPopup();
}

/* ---------------- CARDS ---------------- */

function setupCardPlay() {
  const allCards = document.querySelectorAll(".card-play");

  allCards.forEach((card) => {
    card.addEventListener("click", () => {
      const songIndex = Number(card.dataset.song);
      playSong(songIndex);
    });
  });
}

/* ---------------- UPLOAD SONGS ---------------- */

function uploadSongs(files) {
  const selectedFiles = Array.from(files);
  if (selectedFiles.length === 0) return;

  let currentFileIndex = 0;

  function processNextFile() {
    if (currentFileIndex >= selectedFiles.length) {
      saveUserSongs();
      renderSongs(songs);

      if (searchInput && searchInput.value.trim()) {
        handleSearch();
      }
      return;
    }

    const file = selectedFiles[currentFileIndex];
    const fileURL = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");

    openArtistPopup(file, (artistName) => {
      const newSong = {
        title: cleanName,
        artist: artistName,
        file: fileURL,
        cover: "art.jpg",
        isDefault: false
      };

      songs.push(newSong);
      currentFileIndex += 1;
      processNextFile();
    });
  }

  processNextFile();
}

/* ---------------- AUTH ---------------- */

function showApp() {
  if (authScreen) authScreen.classList.add("hidden-auth");
  if (appContainer) appContainer.style.display = "flex";

  const lowerSide = document.querySelector(".lowerside");
  if (lowerSide) lowerSide.style.display = "flex";

  const fullUser = getFullCurrentUser();
  if (fullUser) {
    if (profileName) profileName.textContent = fullUser.name || fullUser.username || "User";
    if (profileEmail) profileEmail.textContent = fullUser.email || "";
    if (profileMobile) profileMobile.textContent = fullUser.mobile || "";
    if (profileImage) profileImage.src = fullUser.photo || "default-user.png";
  }

  loadUserSongs();
  renderSongs();
  renderPlaylists();
  setSongsTitle("All Songs");
  currentPlaylistView = null;

  if (songs.length > 0) {
    currentSongIndex = 0;
    loadSong(currentSongIndex);
  } else {
    if (nowPlayingTitle) nowPlayingTitle.textContent = "No song selected";
    if (nowPlayingArtist) nowPlayingArtist.textContent = "-";
  }
}

function showAuth() {
  if (authScreen) authScreen.classList.remove("hidden-auth");
  if (appContainer) appContainer.style.display = "none";

  const lowerSide = document.querySelector(".lowerside");
  if (lowerSide) lowerSide.style.display = "none";
}

function signupUser() {
  const name = authName ? authName.value.trim() : "";
  const email = authEmail ? authEmail.value.trim() : "";
  const mobile = authMobile ? authMobile.value.trim() : "";
  const username = authUsername ? authUsername.value.trim() : "";
  const password = authPassword ? authPassword.value.trim() : "";
  const photoFile = authPhoto && authPhoto.files ? authPhoto.files[0] : null;

  if (!name || !email || !mobile || !username || !password) {
    showMessagePopup(
      "Missing Details",
      "Please enter full name, email, mobile number, username and password."
    );
    return;
  }

  const users = getUsers();

  const usernameExists = users.find((user) => user.username === username);
  if (usernameExists) {
    showMessagePopup("Account Exists", "Username already exists.");
    return;
  }

  const emailExists = users.find((user) => user.email === email);
  if (emailExists) {
    showMessagePopup("Account Exists", "Email already exists.");
    return;
  }

  const mobileExists = users.find((user) => user.mobile === mobile);
  if (mobileExists) {
    showMessagePopup("Account Exists", "Mobile number already exists.");
    return;
  }

  function finishSignup(photoData = "") {
    const newUser = {
      name,
      email,
      mobile,
      username,
      password,
      photo: photoData
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser({ username });

    localStorage.setItem(`spotifyClone_playlistsData_${username}`, JSON.stringify({}));
    localStorage.setItem(`spotifyClone_songs_${username}`, JSON.stringify([]));

    showPopup({
      title: "Account Created",
      text: `Welcome, ${name}! Your account is ready.`,
      buttons: [
        {
          label: "Start Listening",
          onClick: () => {
            closePopup();
            showApp();
          }
        }
      ]
    });
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function () {
      finishSignup(reader.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    finishSignup("");
  }
}

function loginUser() {
  const username = authUsername ? authUsername.value.trim() : "";
  const password = authPassword ? authPassword.value.trim() : "";

  if (!username || !password) {
    showMessagePopup("Missing Details", "Please enter username and password.");
    return;
  }

  const users = getUsers();

  const matchedUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!matchedUser) {
    showMessagePopup("Login Failed", "Invalid username or password.");
    return;
  }

  setCurrentUser({ username });

  const displayName = matchedUser.name || matchedUser.username;

  showPopup({
    title: "Login Successful",
    text: `Welcome back, ${displayName}!`,
    buttons: [
      {
        label: "Continue",
        onClick: () => {
          closePopup();
          showApp();
        }
      }
    ]
  });
}

function logoutUser() {
  if (audioPlayer) audioPlayer.pause();
  clearCurrentUser();

  if (authName) authName.value = "";
  if (authEmail) authEmail.value = "";
  if (authMobile) authMobile.value = "";
  if (authUsername) authUsername.value = "";
  if (authPassword) authPassword.value = "";
  if (authPhoto) authPhoto.value = "";

  if (profileName) profileName.textContent = "User";
  if (profileEmail) profileEmail.textContent = "user@email.com";
  if (profileMobile) profileMobile.textContent = "+91 XXXXXXXXXX";
  if (profileImage) profileImage.src = "default-user.png";

  songs = [...defaultSongs];
  currentSongIndex = 0;
  currentPlaylistView = null;

  showAuth();
}

/* ---------------- EVENTS ---------------- */

if (playPauseBtn) playPauseBtn.addEventListener("click", playPauseSong);
if (nextBtn) nextBtn.addEventListener("click", playNextSong);
if (prevBtn) prevBtn.addEventListener("click", playPrevSong);

if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active-toggle", isShuffle);
  });
}

if (repeatBtn) {
  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active-toggle", isRepeat);
  });
}

if (homeBtn) homeBtn.addEventListener("click", showHome);
if (searchBtn) searchBtn.addEventListener("click", showSearch);
if (searchInput) searchInput.addEventListener("input", handleSearch);

if (createPlaylistBtn) {
  createPlaylistBtn.addEventListener("click", createPlaylist);
}

if (uploadSongBtn && songUploader) {
  uploadSongBtn.addEventListener("click", () => {
    songUploader.click();
  });

  songUploader.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      uploadSongs(e.target.files);
      e.target.value = "";
    }
  });
}

if (volumeBar && audioPlayer && muteBtn) {
  volumeBar.addEventListener("input", () => {
    audioPlayer.volume = Number(volumeBar.value);
    lastVolume = Number(volumeBar.value);

    muteBtn.innerHTML = audioPlayer.volume === 0
      ? `<span class="material-symbols-outlined">volume_off</span>`
      : `<span class="material-symbols-outlined">volume_up</span>`;
  });
}

if (muteBtn && audioPlayer && volumeBar) {
  muteBtn.addEventListener("click", () => {
    if (audioPlayer.volume > 0) {
      lastVolume = audioPlayer.volume;
      audioPlayer.volume = 0;
      volumeBar.value = 0;
      muteBtn.innerHTML = `<span class="material-symbols-outlined">volume_off</span>`;
    } else {
      audioPlayer.volume = lastVolume || 1;
      volumeBar.value = lastVolume || 1;
      muteBtn.innerHTML = `<span class="material-symbols-outlined">volume_up</span>`;
    }
  });
}

if (seekBar && audioPlayer) {
  seekBar.addEventListener("input", () => {
    if (audioPlayer.duration) {
      audioPlayer.currentTime = (seekBar.value / 100) * audioPlayer.duration;
    }
  });
}

if (audioPlayer && durationEl) {
  audioPlayer.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audioPlayer.duration);
  });
}

if (audioPlayer && seekBar && currentTimeEl && durationEl) {
  audioPlayer.addEventListener("timeupdate", () => {
    if (audioPlayer.duration) {
      seekBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
      durationEl.textContent = formatTime(audioPlayer.duration);
    }
  });
}

if (audioPlayer) {
  audioPlayer.addEventListener("ended", () => {
    if (isRepeat) {
      audioPlayer.currentTime = 0;
      audioPlayer.play();
    } else {
      playNextSong();
    }
  });

  audioPlayer.addEventListener("play", () => updatePlayButton(true));
  audioPlayer.addEventListener("pause", () => updatePlayButton(false));
}

if (loginBtn) loginBtn.onclick = loginUser;
if (signupBtn) signupBtn.onclick = signupUser;
if (logoutBtn) logoutBtn.onclick = logoutUser;

if (authPassword) {
  authPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      loginUser();
    }
  });
}

/* ---------------- INITIAL LOAD ---------------- */

createPopup();
setupCardPlay();
updatePlayButton(false);
setSongsTitle("All Songs");

const savedUser = getCurrentUser();

if (savedUser) {
  showApp();
} else {
  showAuth();
}