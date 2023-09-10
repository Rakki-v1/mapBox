import * as React from 'react';
import Map, {Source, Layer, Marker, NavigationControl} from 'react-map-gl';
import { Popup } from 'react-map-gl';
import RoomIcon from '@mui/icons-material/Room';
import StarIcon from '@mui/icons-material/Star';
import "./App.css" ;
import axios from "axios";
import { format } from "timeago.js"
import Register from './components/register';
import Login from './components/login';

function App() {
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser] = React.useState(myStorage.getItem("user"));
  const [pins,setPins] = React.useState([]);
  const [currentPlaceId,setCurrentPlaceId] = React.useState(null);
  const [newPlace, setNewPlace] = React.useState(null);
  const [title, setTitle] = React.useState(null);
  const [description, setDescription] = React.useState(null);
  const [rating, setRating] = React.useState(0);
  const [showRegister, setShowRegister] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const [viewport, setViewport] = React.useState({
    width: "100vw",
    height: "100vh",
    longitude: 138.2529,
    latitude: 38.2048,
    zoom: 4.5
  })
  const dataOne = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: [
        [137.96221,36.233058],
        [137.595203,35.576358],
        [137.567664,35.526449]
      ]
    }
  }


  React.useEffect(() => {
    const getPins = async () => {
      try {
       const res = await axios.get("/pins");
       setPins(res.data);
      } catch(err) {
       console.log(err)
      }
    }
    getPins();
  },[])

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({...viewport, latitude:lat, longitude:long})
  }

  const handleAddClick = (e) => {
    const longitude  = e.lngLat.lng;
    const latitude  = e.lngLat.lat;
    setNewPlace({
      lat:latitude, 
      long:longitude,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username:currentUser,
      title,
      description,
      rating,
      lat:newPlace.lat,
      long:newPlace.long
    }
    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    }catch(err){
      console.log(err)
    }
  }

  const handleLogout = () => {
    myStorage.removeItem("user");
    setCurrentUser(null);
  }

  return (
    <div> 
    
    {currentUser ? (<button className="button logout" onClick={handleLogout}>Log out</button>) : (
      <div className="buttons">
        <button className="button login" onClick={()=>setShowLogin(true)}>Log in</button>  
        <button className="button register" onClick={()=>setShowRegister(true)}>Register</button>
      </div>
    )}
    {showRegister && <Register setShowRegister={setShowRegister}/> }
    {showLogin && 
      <Login 
        setShowLogin={setShowLogin} 
        myStorage={myStorage} 
        setCurrentUser={setCurrentUser}
        /> 
    }
    
    <Map
      mapboxAccessToken="pk.eyJ1IjoicmFra2k3NTQiLCJhIjoiY2xseHB2OWt3MGcwNjNxbGZpN3p0ZWUyYSJ9.YbPs5NiTj2XugRS_x5_3CA"
      initialViewState={{
        longitude: 138.2529,
        latitude: 38.2048,
        zoom: 4.5
      }}
      style={{width: "100vw", height: "100vh"}}
      mapStyle="mapbox://styles/rakki754/clm1q6e6a00rv01pfgrqk0eb1"
      onDblClick={handleAddClick}
      
    >
    
    {pins.map(p => (
    <div><Marker 
      longitude={p.long}
      latitude={p.lat}
      offsetLeft={-visualViewport.zoom *3.5}
      offsetRight={-visualViewport.zoom *7}
      >
      <RoomIcon style={{ fontSize: visualViewport.zoom *7, color:p.username===currentUser ? "slateblue": "tomato", cursor:"pointer"}} 
       onClick={()=>handleMarkerClick(p._id, p.lat, p.long)}
      />
      </Marker>
      {p._id === currentPlaceId && (
      <Popup 
        longitude={p.long} 
        latitude={p.lat}
        closeButton={true}
        closeOnClick={false}
        anchor="left"
        onClose={()=>setCurrentPlaceId(null)}
        >
        <div className="card">
          <label>Place</label>
          <h4 className="place">{p.title}</h4>
          <label>Review</label>
          <p className="description">{p.description}</p>
          <label>Rating</label>
          <div className="stars">
            {Array(p.rating).fill(<StarIcon className="star"/>)}
          </div>
          <label>Information</label>
          <span className="username">Created by <b>{p.username}</b></span>
          <span className="date">{format(p.createdAt)}</span>
        </div>
      </Popup>)}
      {newPlace && 
        <Popup 
          longitude={newPlace.long} 
          latitude={newPlace.lat}
          closeButton={true}
          closeOnClick={false}
          anchor="left"
          onClose={()=>setNewPlace(null)}
        >
        <div>
          <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input 
              placeholder="Enter a title" 
              onChange={(e)=>setTitle(e.target.value)}/>
            <label>Review</label>
            <textarea 
              placeholder="Say something about this place." 
              onChange={(e)=>setDescription(e.target.value)}/>
            <label>Rating</label>
            <select onChange={(e)=>setRating(e.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <button className = "submitButton" type='submit'>Add Pin</button>
          </form>
        </div>
        </Popup> }
        </div>
        ))}
        <NavigationControl position={"bottom-right"}/>
        <Source id="polylineLayer" type="geojson" data={dataOne}>
          <Layer
            id="lineLayer"
            type="line"
            source="my-data"
            layout={{
              "line-join": "round",
              "line-cap": "round"
            }}
            paint={{
              "line-color": "rgba(3, 170, 238, 0.5)",
              "line-width": 5
            }}
          />
        </Source>
    </Map>  
    
    </div>
  );
}

export default App;
