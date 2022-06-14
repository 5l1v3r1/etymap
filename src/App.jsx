import * as React from "react";
import { useEffect, useState } from "react";
import Map, {
  FullscreenControl,
  NavigationControl,
  Marker,
} from "react-map-gl";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";
import { toGreeklish } from "greek-utils";
import langData2 from "./langData2.json";

const token = import.meta.env.VITE_MAPBOX_TOKEN;

function App() {
  const [wordId, setWordId] = useState(0);
  const [data, setData] = useState([]);
  const [langData, setLangData] = useState([]);
  const [nodes, setNodes] = useState([]);

  const getData = () => {
    axios
      .get("https://api.etymologyexplorer.com/prod/get_trees?ids[]=" + wordId)
      .then((response) => setData(response.data))
      .catch((error) => console.log(error));
  };

  const getrandom = () => {
    axios
      .get(
        `https://api.etymologyexplorer.com/prod/random_etymology?language=English`
      )
      .then((response) => {
        console.log(response.data.word, response.data.id);
        setWordId(response.data.id);
      })
      .catch((error) => console.log(error));
  };

  const [searchValue, setSearchValue] = useState("");
  const getSearch = () => {
    axios
      .get(
        `https://api.etymologyexplorer.com/prod/autocomplete?word=${searchValue}&language=English`
      )
      .then((r) => {
        setWordId(r.data.auto_complete_data[0]["_id"]);
        console.log(
          r.data.auto_complete_data[0]["_id"],
          r.data.auto_complete_data[0]["word"]
        );
        console.log(
          "https://api.etymologyexplorer.com/prod/get_trees?ids[]=" +
            r.data.auto_complete_data[0]["_id"]
        );
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    getData();
  }, []);
  useEffect(() => {
    getData();
  }, [wordId]);

  useEffect(() => {
    if (data[1]) {
      let langs = [],
        langsGlotto = [];
      let langsLoc = {};

      const getLangs = async (lang) => {
        const response = await axios.get(
          `https://glottolog.org/glottolog?search=${lang.replace("Proto-", "")}`
        );
        return [lang, response.request.responseURL];
      };
      const getGlotto = async (lang, url) => {
        const response = await axios.get(url + ".json");
        return [lang, url, response.data];
      };

      Object.keys(data[1].words).map((item) => {
        const lang_name = data[1].words[item].language_name;
        langs.includes(lang_name) || langs.push(lang_name);
      });

      Promise.all(langs.map((l) => getLangs(l)))
        .then((resp) => {
          resp.map((item) => {
            langsGlotto.push([item[0], item[1]]);
          });
        })
        .then(() => {
          Promise.all(langsGlotto.map((l) => getGlotto(l[0], l[1]))).then(
            (resp) => {
              resp.map((result) => {
                langsLoc[result[0]] = {
                  url: result[1],
                  latitude: result[2].latitude,
                  longitude: result[2].longitude,
                };
              });
              setLangData(langsLoc);
            }
          );
        });
    }
  }, [data]);

  useEffect(() => {
    if (data[1]) {
      let list_nodes = [];
      Object.keys(data[1]["words"]).map((item) => {
        list_nodes.push({
          id: data[1]["words"][item]["_id"],
          word: data[1]["words"][item]["word"],
          language: data[1]["words"][item]["language_name"],
          longitude:
            langData[data[1]["words"][item]["language_name"]]["longitude"],
          latitude:
            langData[data[1]["words"][item]["language_name"]]["latitude"],
          definitions:
            data[1]["words"][item]["entries"] &&
            data[1]["words"][item]["entries"][0]["pos"][0]["definitions"][0],
        });
      });
      setNodes(list_nodes);
    }
  }, [langData]);

  return (
    <Map
      initialViewState={{
        longitude: 29,
        latitude: 49,
        zoom: 3.7,
      }}
      mapStyle="mapbox://styles/mapbox/dark-v10"
      // mapStyle="mapbox://styles/agmmnn/cl4094mje000l14n0utbraa7s"
      mapboxAccessToken={token}
      attributionControl={false}
      // onDrag={(e) =>
      //   console.log(
      //     e.viewState.longitude,
      //     e.viewState.latitude,
      //     e.viewState.zoom
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
          placeholder="word"
          style={{
            padding: "1rem",
            paddingInlineStart: "2rem",
            fontSize: "2rem",
            border: "1px solid #ccc",
          }}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? getSearch() : null)}
        />
        <button type="submit" onClick={getSearch}>
          Search
        </button>
        <button type="submit">Random</button>
      </div>

      {nodes.map((item) => {
        return (
          <Marker
            key={item.id}
            longitude={
              item.longitude
                ? item.longitude
                : langData2[item.language].longitude
            }
            latitude={
              item.latitude ? item.latitude : langData2[item.language].latitude
            }
            anchor="bottom"
            cluster={true}
          >
            <div
              className="card"
              style={{
                backgroundColor: "white",
                padding: "0px 10px",
                borderRadius: 10,
                width: 130,
                border: "1px solid #a4a79e",
                fontSize: 15,
                fontFamily: "Cormorant Infant, serif",
                textAlign: "center",
              }}
            >
              <h4>{item.language}</h4>
              <h3>
                {item.word}
                {item.language === "Ancient Greek"
                  ? " (" + toGreeklish(item.word) + ")"
                  : null}
              </h3>
              <p style={{ fontFamily: "Roboto", fontSize: 13 }}>
                {item.definitions}
              </p>
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}

export default App;
