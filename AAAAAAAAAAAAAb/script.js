// RapidAPI key

const RAPIDAPI_KEY = "75cb0e422bmshb17b45ae374adefp1834c2jsnedeb45528d2e";

// API Base URLs
const SPOTIFY_API_URL = "https://spotify23.p.rapidapi.com/search/?q=encodeURIComponent(query)&type=multi&offset=0&limit=10&numberOfTopResults=5";
const MUSIXMATCH_API_URL = "https://musixmatch-lyrics-songs.p.rapidapi.com";
const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const DEEZER_API_URL = "https://deezerdevs-deezer.p.rapidapi.com";
const WEATHER_API_URL = "https://weatherapi-com.p.rapidapi.com";
const GENIUS_API_URL = "https://genius-song-lyrics1.p.rapidapi.com";

// UI Elements
const searchButton = document.getElementById("searchButton");
const searchInput = document.getElementById("searchInput");
const songList = document.getElementById("songList");
const audioPlayer = document.getElementById("audioPlayer");
const weatherInfo = document.getElementById("weatherInfo");

// Event listener for the search button
searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a song name!");
    return;
  }
  const songs = await fetchSongs(query);
  if (songs.length === 0) {
    alert("No songs found. Try a different query.");
    return;
  }
  
  displaySongs(songs);
});

// Fetch songs via Spotify API
async function fetchSongs(query) {
  try {
    const response = await fetch(`${SPOTIFY_API_URL}/search/?q=${encodeURIComponent(query)}&type=multi`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log(data);


    return data.tracks.items.map((song) => ({
      id: song.id,
      title: song.name,
      // artist: song.artists[0].name,
      // previewUrl: song.preview_url,
      // albumArt: song.album.images[0]?.url || "",
    }));
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

// Fetch song lyrics via Musixmatch API
async function fetchLyrics(artist, title) {
  try {
    const response = await fetch(
      `${MUSIXMATCH_API_URL}/track.search?q_artist=${encodeURIComponent(artist)}&q_track=${encodeURIComponent(title)}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Host": "musixmatch-lyrics-songs.p.rapidapi.com",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Musixmatch API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.body.track_list[0]?.track.lyrics.body || "Lyrics not found.";
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return "Error fetching lyrics.";
  }
}

// Fetch artist details via Last.fm API
async function fetchArtistDetails(artistName) {
  try {
    const response = await fetch(`${LASTFM_API_URL}?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=YOUR_LASTFM_API_KEY&format=json`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.artist.bio.content || "Artist bio not found.";
  } catch (error) {
    console.error("Error fetching artist details:", error);
  }
}

// Fetch track info from Deezer API
async function fetchDeezerTrackInfo(trackId) {
  try {
    const response = await fetch(`${DEEZER_API_URL}/track/${trackId}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.preview;
  } catch (error) {
    console.error("Error fetching Deezer track info:", error);
  }
}

// Fetch current weather via WeatherAPI
async function fetchWeather(city) {
  try {
    const response = await fetch(`${WEATHER_API_URL}/current.json?q=${encodeURIComponent(city)}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return `${data.current.condition.text}, ${data.current.temp_c}°C`;
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
}

// Fetch detailed lyrics from Genius Lyrics API
async function fetchGeniusLyrics(title) {
  try {
    const response = await fetch(`${GENIUS_API_URL}/search/?q=${encodeURIComponent(title)}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "genius-song-lyrics1.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Genius API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.hits[0]?.result.lyrics || "Detailed lyrics not available.";
  } catch (error) {
    console.error("Error fetching lyrics from Genius:", error);
  }
}

// Display the fetched songs
function displaySongs(songs) {
  songList.innerHTML = ""; // Clear the previous list

  songs.forEach((song) => {
    const songItem = document.createElement("div");
    songItem.className = "song-item";
    songItem.innerHTML = `
      <img src="${song.albumArt}" alt="Album Art">
      <span>${song.title} - ${song.artist}</span>
    `;

    songItem.addEventListener("click", async () => {
      if (!song.previewUrl) {
        alert("No preview available for this song.");
        return;
      }

      // Play the song preview
      audioPlayer.src = song.previewUrl;
      audioPlayer.play();

      // Fetch lyrics for the song
      const lyrics = await fetchLyrics(song.artist, song.title);
      const geniusLyrics = await fetchGeniusLyrics(song.title);
      const artistDetails = await fetchArtistDetails(song.artist);

      alert(`
        Lyrics (Musixmatch):
        ${lyrics}

        Detailed Lyrics (Genius):
        ${geniusLyrics}

        Artist Details:
        Bio: ${artistDetails}
      `);
    });

    songList.appendChild(songItem);
  });
}
