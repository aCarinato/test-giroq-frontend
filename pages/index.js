import React, { useState, useEffect } from 'react';
import useSupercluster from 'use-supercluster';
import axios from 'axios';

import Map from '../components/map/map';
import EventsFilter from '../components/events/events-filter';
import EventList from '../components/events/event-list';
import SwitchTab from '../components/mobile/switch-tab';

export default function App() {
  // MAP
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(9);
  const [coordinates, setCoordinates] = useState({
    lat: 45.4,
    lng: 11.5,
  });

  // SELECTION
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [currentMarker, setCurrentMarker] = useState({});

  // EVENTS
  const [events, setEvents] = useState([]);

  // FILTER EVENTS
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  const sett = today.setDate(today.getDate() + 7);
  const oneWeek = new Date(sett);
  const oneWeekISO = oneWeek.toISOString().split('T')[0];

  const [firstDate, setFirstDate] = useState(todayISO);
  const [lastDate, setLastDate] = useState(oneWeekISO);

  const [typeACheck, setTypeACheck] = useState(true);
  const [typeBCheck, setTypeBCheck] = useState(true);
  // const [types, setTypes] = useState(['A', 'B']);

  // MOBILE
  const [mapHeight, setMapHeight] = useState(null);
  const [mobileView, setMobileView] = useState(null);
  const [showList, setShowList] = useState(false);
  const [mapSelected, setMapSelected] = useState(true);

  const calcHeight = () => {
    if (window.innerWidth <= 820) {
      setMobileView(true);
      if (mapSelected) {
        setShowList(false);
        // console.log(`mobileView: ${mobileView}`);
        return '600px';
      } else {
        // setShowList(true);
        return;
      }
    } else {
      setMobileView(false);
      setShowList(true);
      // console.log(`mobileView: ${mobileView}`);
      return '80vh';
    }
  };

  useEffect(() => {
    setMapHeight(calcHeight());
  }, [calcHeight]);

  useEffect(() => {
    if (bounds) {
      const blLat = bounds[1];
      const trLat = bounds[3];
      const blLong = bounds[0];
      const trLong = bounds[2];

      // const blLat = bounds.sw.lat;
      // const trLat = bounds.ne.lat;
      // const blLong = bounds.sw.lng;
      // const trLong = bounds.ne.lng;

      // console.log(
      //   `blLat:${blLat} - blLong:${blLong} - trLat:${trLat} - trLong:${trLong}`
      // );
      const typesChecked = [typeACheck, typeBCheck];

      const types = typesChecked.map((tipo, index) => {
        if (tipo) {
          return index + 1;
        } else {
          return 0;
        }
      });

      const filterParams = {
        firstDate,
        lastDate,
        trLat,
        trLong,
        blLat,
        blLong,
        types,
      };

      const getEvents = async () => {
        try {
          // const retrievedEvents = await axios.get(
          //   // `${process.env.NEXT_PUBLIC_API}/events/`
          // );
          console.log(`DENTRO IL TRY. `);
          console.log(`${process.env.NEXT_PUBLIC_API}/events/`);
          const retrievedEvents = await axios.post(
            `${process.env.NEXT_PUBLIC_API}/events/`,
            filterParams
          );
          setEvents(retrievedEvents.data);
          // console.log(events);
        } catch (err) {
          console.log('ndata de merda');
          console.log(err);
        }
      };
      getEvents();
    }
    // }
  }, [firstDate, lastDate, bounds, typeACheck, typeBCheck]);

  useEffect(() => {
    if (currentMarker !== {}) {
      const currMarkerLat = currentMarker.latitude;
      const currMarkerLng = currentMarker.longitude;
      // mapRef.current.panTo({ lat, lng });
      // mapRef.current.setZoom(15);

      setCoordinates({ lat: currMarkerLat, lng: currMarkerLng });
      // console.log(currentMarker);
      // console.log(coordinates);
      // setZoom(12);
      // setCurrentMarker(null);
    }
    setCoordinates({ lat: 45.4, lng: 11.5 });
  }, [currentMarker]);

  const points = events.map((event) => ({
    type: 'Feature',
    properties: {
      cluster: false,
      eventId: event._id,
      eventType: event.type,
      eventDate: event.date,
      eventTitle: event.title,
      eventOrganiser: event.organiser,
      eventDescription: event.description,
      eventImage: event.image,
      eventLat: event.lat,
      eventLong: event.long,
    },
    geometry: {
      type: 'Point',
      coordinates: [event.long, event.lat],
    },
  }));

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 },
  });
  // console.log(clusters);

  return (
    <div className="container-fluid">
      {/* <div className="row">
        <div className="col-lg-12">QUESTO É IL PLACEID: {currentPlaceId}</div>
      </div> */}
      <div className="row">
        <div className="col-lg-12">
          <EventsFilter
            typeACheck={typeACheck}
            setTypeACheck={setTypeACheck}
            typeBCheck={typeBCheck}
            setTypeBCheck={setTypeBCheck}
            // types={types}
            // setTypes={setTypes}
            firstDate={firstDate}
            setFirstDate={setFirstDate}
            lastDate={lastDate}
            setLastDate={setLastDate}
          />
        </div>
      </div>
      {mobileView && (
        <SwitchTab
          mapSelected={mapSelected}
          setMapSelected={setMapSelected}
          showList={showList}
          setShowList={setShowList}
        />
      )}
      <div className="row">
        <div className="col-lg-4">
          {showList === true && (
            <EventList
              events={events}
              typeACheck={typeACheck}
              typeBCheck={typeBCheck}
              setCurrentMarker={setCurrentMarker}
              mobileView={mobileView}
              setMapSelected={setMapSelected}
              setCoordinates={setCoordinates}
              setCurrentPlaceId={setCurrentPlaceId}
              coordinates={coordinates}
            />
          )}
        </div>
        <div className="col-lg-8">
          <Map
            mapHeight={mapHeight}
            points={points}
            clusters={clusters}
            supercluster={supercluster}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            setBounds={setBounds}
            zoom={zoom}
            setZoom={setZoom}
            typeACheck={typeACheck}
            typeBCheck={typeBCheck}
            currentPlaceId={currentPlaceId}
            setCurrentPlaceId={setCurrentPlaceId}
            setCurrentMarker={setCurrentMarker}
            mobileView={mobileView}
            currentMarker={currentMarker}
          />
        </div>
      </div>
    </div>
  );
}
