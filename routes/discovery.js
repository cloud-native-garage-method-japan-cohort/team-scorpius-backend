const express = require("express");

const DiscoveryV2 = require("ibm-watson/discovery/v2");
const { IamAuthenticator } = require("ibm-watson/auth");
const config = require("config");

// eslint-disable-next-line new-cap
const router = express.Router();

// 接続情報
const discovery = new DiscoveryV2({
  version: config.get("watson.discovery.version"),
  authenticator: new IamAuthenticator({
    apikey: config.get("watson.discovery.apikey"),
  }),
  serviceUrl: config.get("watson.discovery.serviceUrl"),
});

//const createQuery = (categoryLabel, searchStr) => {
const createQuery = (searchStr) => {
  const texts = searchStr
    // 半角あるいは全角のスペースで検索ワードを分割
    .split(/[ 　]/)
    .map((item) => `text:"${item}"`)
    .join(",");
  //return `enriched_text.categories.label::"${categoryLabel}",(${texts})`;
  return `${texts}`;
};

const runQuery = async (categoryLabel, searchStr) => {
  const query = createQuery(categoryLabel, searchStr);

  const queryParams = {
    projectId: config.get("watson.discovery.projectId"),
    query,
    highlight: true,
    // passages: { per_document: false },
  };

  console.log(`Running query - ${query}`);
  const queryResponse = await discovery.query(queryParams);

  const results = queryResponse.result.results;

  console.log(JSON.stringify(results, null, 2));
  if (queryResponse.result.results && queryResponse.result.results.length > 0) {
    const results = queryResponse.result.results;
    // 変数名あとで考える
    const responseArray = results.map((x) => {
      const filename = x.extracted_metadata.filename
      .replace(/<em>/g, "")
      .replace(/<\/em>/g, "");
      const passage = x.document_passages[0].passage_text;
      return {
        filename: filename,
        passage: passage,
      };
    });
    return responseArray;

    // const textArray = queryResponse.result.results[0].text
    // const filtered = textArray.map((text) => {
    //   return text.replace(/<em>/g, '').replace(/<\/em>/g, '');
    // });
    // return filtered;
  } else {
    return [];
  }
};

router.post("/search", async (req, res) => {
  try {
    if (!req.body.searchText) {
      res.status(400).send("Missing search text.");
      return;
    }

    //const responseText = await runQuery('/health and fitness/disease', req.body.searchText);
    const responseArray = await runQuery(req.body.searchText);
    res.json(responseArray);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to call watson service");
  }
});

module.exports = router;
