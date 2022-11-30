import axios from "axios";
import langData from "../../../app/langData.json";

// http://localhost:3000/api/data/0

export default function handler(req, res) {
  const id = req.query.id;
  let etyexp_data = "",
    langs = [],
    langsGlotto = [],
    langsLoc = {};

  const getLangs = async (lang) =>
    await axios
      .get(
        `https://glottolog.org/glottolog?search=${lang.replace("Proto-", "")}`,
        { maxRedirects: 0, validateStatus: null }
      )
      .then((response) => [lang, response.headers.location]);

  const getGlotto = async (lang, url) =>
    await axios
      .get(url + ".json")
      .then((response) => [lang, url, response.data])
      .catch(() => [lang, url, { latitude: null, longitude: null }]);

  axios
    .get("https://api.etymologyexplorer.com/prod/get_trees?ids[]=" + id)
    .then((resp) => {
      etyexp_data = resp.data;
      Object.keys(resp.data[1].words).map((item) => {
        const lang_name = resp.data[1].words[item].language_name;
        langs.includes(lang_name) || langs.push(lang_name);
      });
    })
    .then(() => {
      console.log(langs);
      Promise.all(langs.map((l) => getLangs(l)))
        .then((resp) => resp.map((item) => langsGlotto.push(item)))
        .then(() =>
          Promise.all(langsGlotto.map((l) => getGlotto(l[0], l[1])))
            .then((resp) => {
              resp.map((result) => {
                console.log(result);
                langsLoc[result[0]] = {
                  url: result[1],
                  latitude: result[2].latitude
                    ? result[2].latitude
                    : Object.hasOwn(langData, result[0])
                    ? langData[result[0]].latitude
                    : null,
                  longitude: result[2].longitude
                    ? result[2].longitude
                    : Object.hasOwn(langData, result[0])
                    ? langData[result[0]].longitude
                    : null,
                };
              });
            })
            .then(() => res.json({ data: etyexp_data, lang_data: langsLoc }))
        );
    })
    .catch((error) => res.json({ error: error }));
}

/*
{
  "id": "226499",
  "word": "fig",
  "definitions": "figgg",
  "language_name": "Proto-Germanic",
  "coordinates": [49, 24] // null
}
*/
