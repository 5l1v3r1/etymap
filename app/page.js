"use client";
import Head from "next/head";
import styles from "./styles.module.css";

import { useRef, useEffect, useState } from "react";
import Map, {
  FullscreenControl,
  NavigationControl,
  Marker,
} from "react-map-gl";

import { toGreeklish } from "greek-utils";
import langData2 from "./langData.json";

import { Montserrat, CormorantInfant, Roboto } from "@next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: "400",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
});

import "mapbox-gl/dist/mapbox-gl.css";

export default function Home() {
  const [wordId, setWordId] = useState(0);
  const [word, setWord] = useState("word");
  const [data, setData] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const mapRef = useRef();

  useEffect(() => {
    getData();
    console.log(mapRef);
  }, []);
  useEffect(() => {
    getData();
  }, [wordId]);

  const getData = () => {
    fetch("/api/data/" + wordId)
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.log(error));
  };

  const getrandom = () => {
    fetch(
      `https://api.etymologyexplorer.com/prod/random_etymology?language=English`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data.word);
        setWordId(data.id);
        setWord(data.word);
      })
      .catch((error) => console.log(error));
  };

  const getSearch = () => {
    fetch(
      `https://api.etymologyexplorer.com/prod/autocomplete?word=${searchValue.trim()}&language=English`
    )
      .then((response) => response.json())
      .then((data) => {
        setWordId(data.auto_complete_data[0]["_id"]);
        setWord(data.auto_complete_data[0]["word"]);
        console.log(
          data.auto_complete_data[0]["_id"],
          data.auto_complete_data[0]["word"]
        );
        console.log(
          "https://api.etymologyexplorer.com/prod/get_trees?ids[]=" +
            data.auto_complete_data[0]["_id"]
        );
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (Object.hasOwn(data, "data")) {
      console.log(data);
      let list_nodes = [];
      Object.keys(data.data[1]["words"]).map((item) => {
        list_nodes.push({
          id: data.data[1]["words"][item]["_id"],
          word: data.data[1]["words"][item]["word"],
          language: data.data[1]["words"][item]["language_name"],
          longitude:
            data.lang_data[data.data[1]["words"][item]["language_name"]][
              "longitude"
            ],
          latitude:
            data.lang_data[data.data[1]["words"][item]["language_name"]][
              "latitude"
            ],
          definitions:
            data.data[1]["words"][item]["entries"] &&
            data.data[1]["words"][item]["entries"][0]["pos"][0][
              "definitions"
            ][0],
        });
      });
      setNodes(list_nodes);
    }
  }, [data]);

  return (
    <div className={styles.container}>
      <Head>
        <title>etymap</title>
        <meta name="description" content="Etymology Map" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className={roboto.className}>
        <div className={styles.root}>
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: 18.5,
              latitude: 48.5,
              zoom: 4,
              ////
              // longitude: 17,
              // latitude: 49,
              // zoom: 4.2,
              // bearing: 13,
              // pitch: 60,
            }}
            // mapboxAccessToken="pk.eyJ1IjoiYWdtbW5uIiwiYSI6ImNsNDA4eTVqbDA3ZWszZnIydWQwaXlwMDUifQ.klohJw1mXmjIzTAbfoejpw"
            // mapStyle="mapbox://styles/agmmnn/cl4094mje000l14n0utbraa7s"
            // mapStyle="mapbox://styles/mapbox/dark-v10"

            mapboxAccessToken="pk.eyJ1Ijoibm9ub3VtYXN5IiwiYSI6ImNrMTBmY3MycTA1YTEzY3F3ZHZ3eHNsdTAifQ.7r-ppKeBALXFid9Vmpa9Pw"
            mapStyle="mapbox://styles/nonoumasy/cl4l4kxha000c14nyouypen0w?optimize=true"
            projection={"globe"}
            attributionControl={false}
            // onDrag={(e) =>
            //   console.log(
            //     e.viewState.longitude,
            //     e.viewState.latitude,
            //     e.viewState.zoom,
            //     e.viewState.bearing,
            //     e.viewState.pitch,
            //     mapRef.current.getCanvasContainer()
            //   )
            // }
          >
            <FullscreenControl />
            <NavigationControl />
            <div
              style={{
                position: "absolute",
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                padding: "10px",
              }}
            >
              <input
                placeholder={word}
                style={{
                  padding: "1rem",
                  paddingInlineStart: "2rem",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                }}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => (e.key === "Enter" ? getSearch() : null)}
              />
              <button type="submit" onClick={searchValue ? getSearch : null}>
                Search
              </button>
              <button type="submit" onClick={getrandom}>
                Random
              </button>
            </div>

            {nodes.map((item) => {
              return (
                <Marker
                  key={item.id}
                  draggable={true}
                  anchor="bottom"
                  cluster={true}
                  /* 
                  workaround, if the item does not have a location value
                  default location values: lat:50 lon:19
                  */
                  longitude={
                    item.longitude ||
                    (langData2.hasOwnProperty(item.language)
                      ? langData2[item.language].longitude
                      : 19)
                  }
                  latitude={
                    item.latitude ||
                    (langData2.hasOwnProperty(item.language)
                      ? langData2[item.language].latitude
                      : 50)
                  }
                >
                  <div
                    className={styles.card}
                    style={{
                      backgroundColor: "azure",
                      padding: "6px 6px",
                      width: 130,
                      borderRadius: 4,
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.24)",
                      textAlign: "center",
                      lineHeight: "0.8rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: "2px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontFamily: "Cormorant Infant, serif",
                          padding: "4px 10px",
                          backgroundColor: "#5794c6",
                          color: "white",
                          borderRadius: "10px ",
                        }}
                      >
                        {item.language}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontFamily: "Cormorant Infant, serif",
                        padding: "9px 0px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.word}
                      {item.language === "Ancient Greek"
                        ? " (" + toGreeklish(item.word) + ")"
                        : null}
                    </div>
                    <div
                      style={{
                        fontFamily: { montserrat },
                        fontSize: 11,
                      }}
                    >
                      {item.definitions}
                    </div>
                  </div>
                </Marker>
              );
            })}
          </Map>
        </div>
      </main>
    </div>
  );
}
