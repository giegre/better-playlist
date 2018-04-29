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
          <li style={{'margin-bottom':'15px'}}>{song.name}<br/>Duration: {song.duration}</li>
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
    .then(data => this.setState({
      playlists: data.items.map(item => {
        console.log(data.items);
        return {
          name: item.name,
          imageUrl: item.images.find(image => image.width === 300).url,
          songs: []
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
          </div> : <button onClick={() => window.location = 'http://localhost:8888/login'}
            style={{padding: '20px', 'fontSize': '32px', 'marginTop': '20px'}} >Sign in with Spotify</button>
        }
      </div>
    );
  }
}

export default App;
