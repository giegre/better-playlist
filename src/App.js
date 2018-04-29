import React, { Component } from 'react';
import './App.css';
import './css/bootstrap.min.css';

let defaultStyle = {
  color: '#666'
}

let tempServerData = {
  user: {
    name: 'Apabae',
    playlists: [
      {
        name: 'My Favorites',
        songs: [
          {name:'Thriller', duration: 1345},
          {name:'Beat It', duration: 1236},
          {name:'Smooth Criminal', duration: 7000}
        ]
      },
      {
        name: 'Discover Weekly',
        songs: [
          {name:'One More Time', duration: 1345},
          {name:'TT', duration: 1236},
          {name:'Signal', duration: 7000}
        ]
      },
      {
        name: 'Another Playlists - Kpop!',
        songs: [
          {name:'I Got a Boy', duration: 1345},
          {name:'Candy Pop', duration: 1236},
          {name:'Cheer Up', duration: 7000}
        ]
      },
      {
        name: 'Another Playlists - Jpop!',
        songs: [
          {name:'365 Nichi no Kamihikouki', duration: 1345},
          {name:'Brave Shine', duration: 1236},
          {name:'Crossing Field', duration: 7000}
        ]
      }
    ]
  }
};

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
      tempData: {},
      filterString: ''
    }
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({tempData: tempServerData});
    }, 1000);
  }
  render () {

    {/*let playlistElements = []
    if(this.state.tempData.user){
      this.state.tempData.user.playlists.forEach(playlist =>
        playlistElements.push(<Playlist playlist={playlist}/>)
      )
    } <- map versi panjang*/}

    return (
      <div className="App">
        {this.state.tempData.user ?
          <div>
            <h1 style={{...defaultStyle, 'font-size': '54px'}}>
              {this.state.tempData.user.name}s Playlists
            </h1>
            <PlaylistCounter playlists={this.state.tempData.user.playlists}/>
            <HourCounter playlists={this.state.tempData.user.playlists}/>
            <Filter onInputChange={text => this.setState({filterString: text})} />
            {this.state.tempData.user.playlists.filter(playlist =>
              playlist.name.toLowerCase().includes(
                this.state.filterString.toLowerCase()
              )
            ).map(playlist =>
              <Playlist playlist={playlist}/>
            )}
          </div> : <h1 style={defaultStyle}>'Loading...'</h1>
        }
      </div>
    );
  }
}

export default App;
