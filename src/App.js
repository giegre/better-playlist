import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string'

let defaultStyle = {
  color: '#666'
}

class PlaylistCounter extends Component {
  render () {
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{this.props.playlists.length} Playlists</h2>
      </div>
    );
  }
}

class HourCounter extends Component {
  render () {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
      return songs.concat(eachPlaylist.songs)
    }, [])
    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration
    }, 0)
    return (
      <div style={{...defaultStyle, width: '40%', display: 'inline-block'}}>
        <h2>{Math.round(totalDuration/60)} Hours</h2>
      </div>
    );
  }
}

class Filter extends Component {
  render () {
    return (
      <div style={defaultStyle}>
        <input type="text" onKeyUp={e =>
          this.props.onInputChange(e.target.value)} />
      </div>
    );
  }
}

class Playlist extends Component {
  render () {
    let playlist = this.props.playlist;
    return (
      <div style={defaultStyle} className="playlist-box">
        <img src={playlist.imageUrl} style={{width: '70%'}}/>
        <h3>{playlist.name}</h3>
        <ul>
        {playlist.songs.map(song =>
          <li style={{'margin-bottom':'15px'}}>{song.name}</li>
        )}
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      serverData: {},
      filterString: ''
    }
  }
  componentDidMount() {
    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

    if(!accessToken)
      return;

    fetch('https://api.spotify.com/v1/me', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(data => this.setState({
      user: {
        name: data.id
      }
    }));

    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
    .then(playlistData => {
      let playlists = playlistData.items
      let trackDataPromises = playlists.map(playlist => {
        let responsePromise = fetch(playlist.tracks.href, {
          headers: {'Authorization': 'Bearer ' + accessToken}
        });
        let trackDataPromise = responsePromise
        .then(response => response.json());
        return trackDataPromise
      })
      let allTracksDataPromises = Promise.all(trackDataPromises)
      let playlistsPromise = allTracksDataPromises.then(trackDatas => {
        trackDatas.forEach((trackData, i)=> {
          playlists[i].trackDatas = trackData.items
          .map(item => item.track)
          .map(trackData => ({
            name: trackData.name,
            duration: trackData.duration_ms / 1000
          }))
        })
        return playlists
      })
      return playlistsPromise
    })
    .then(playlists => this.setState({
      playlists: playlists.map(item => {
        return {
          name: item.name,
          imageUrl: item.images.find(image => image.width === 300).url,
          songs: item.trackDatas.slice(0,3)
        }
      })
    }));

  }
  render () {

    let playlistToRender =
      this.state.user && this.state.playlists ?
        this.state.playlists.filter(playlist =>
          playlist.name.toLowerCase().includes(
            this.state.filterString.toLowerCase()
          )
        ) : []

    return (
      <div className="App">
        {this.state.user ?
          <div>
            <h1 style={{...defaultStyle, 'fontSize': '54px'}}>
              {this.state.user.name}&apos;s Playlists
            </h1>
            <PlaylistCounter playlists={playlistToRender}/>
            <HourCounter playlists={playlistToRender}/>
            <Filter onInputChange={text => this.setState({filterString: text})} />
            {playlistToRender.map(playlist =>
              <Playlist playlist={playlist}/>
            )}
          </div> : <button onClick={() => {
              window.location = window.location.href.includes('localhost')
              ? 'http://localhost:8888/login'
              : 'https://better-playlists-backend.herokuapp.com/login'}
            }
            style={{padding: '20px', 'fontSize': '32px', 'marginTop': '20px'}} >Sign in with Spotify</button>
        }
      </div>
    );
  }
}

export default App;
