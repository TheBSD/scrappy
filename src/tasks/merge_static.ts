import fs from "fs";
import path from "path";
import { getMainDomain } from "@theWallProject/addonCommon";
import { APIScrapperFileDataSchema } from "../types";
import { log, cleanWebsite, error } from "../helper";
import { manualDeleteIds, manualOverrides } from "./manual_resolve/duplicate";
// import MERGED_CB from "../../results/2_merged/1_MERGED_CB.json";

const folderPath = path.join(__dirname, "../../results/1_batches/static");
const mergedCBPath = path.join(
  __dirname,
  "../../results/2_merged/1_MERGED_CB.json",
);

const outputFilePath = path.join(
  __dirname,
  "../../results/2_merged/2_MERGED_ALL.json",
);

const loadJsonFiles = (folderPath: string) => {
  const mergedCBContent = fs.readFileSync(mergedCBPath, "utf-8");

  let combinedArray = APIScrapperFileDataSchema.parse(
    JSON.parse(mergedCBContent),
  );

  const files = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".json"));

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsedData = APIScrapperFileDataSchema.parse(JSON.parse(fileContent));

    log(`Static File ${file} has ${parsedData.length} rows`);

    for (const newRow of parsedData) {
      const siteExists = combinedArray.some((row) => {
        return newRow.ws && cleanWebsite(newRow.ws) === cleanWebsite(row.ws);
      });

      if (siteExists) {
        error(`Skipping Duplicate website:`, newRow);
        continue;
      } else {
        combinedArray.push(newRow);
      }

      // if (newRow.ws && urls.has(newRow.ws)) {
      //   parsedData
      //     .filter((row) => row.id === newRow.id)
      //     .forEach((row) => {
      //       // only show if not identical but ignore changes to cbRank
      //       const row1 = { ...row, cbRank: undefined };
      //       const row2 = { ...newRow, cbRank: undefined };

      //       if (JSON.stringify(row1) !== JSON.stringify(row2)) {
      //         error(`Duplicate id: ${newRow.id}`, row);
      //       }
      //     });

      //   continue;
      // }

      // urls.add(newRow.id);

      // const existingIndex = combinedArray.findIndex((existingObj) =>
      //   areDuplicates(existingObj, newRow),
      // );

      // if (existingIndex !== -1) {
      //   combinedArray[existingIndex] = mergeObjects(
      //     combinedArray[existingIndex],
      //     newRow,
      //   );
      // } else {
      //   combinedArray.push(newRow);
      // }
    }
  });

  const deDubeArray = combinedArray.flatMap((row) => {
    row.li = cleanWebsite(row.li);
    row.ws = cleanWebsite(row.ws);
    row.fb = cleanWebsite(row.fb);
    row.tw = cleanWebsite(row.tw);

    const { id } = row;

    if (manualDeleteIds.includes(id)) return [];

    // const dubName = tmpArr.find((row) => row.name === name);
    // const dubWebsite = tmpArr.find((row) => row.ws === ws && ws);
    // const dubFb = tmpArr.find((row) => row.fb === fb && fb);
    // const dubLi = tmpArr.find((row) => row.li === li && li);
    // const dubTw = tmpArr.find((row) => row.tw === tw && tw);

    // if (dubNameWebsite) {
    //   error(`Duplicate name and website: ${row.name} ${row.ws}`, {
    //     li1: row.li,
    //     li2: dubNameWebsite.li,
    //     tw1: row.tw,
    //     tw2: dubNameWebsite.tw,
    //     reasons1: row.reasons,
    //     reasons2: dubNameWebsite.reasons,
    //   });
    //   return [];
    // } else

    // if (dubName) {
    //   error(`Duplicate name: ${row.name}`, {
    //     li1: row.li,
    //     li2: dubName.li,
    //     ws1: row.ws,
    //     ws2: dubName.ws,
    //     tw1: row.tw,
    //     tw2: dubName.tw,
    //     reasons1: row.reasons,
    //     reasons2: dubName.reasons,
    //   });
    //   return [];
    // } else
    // if (dubWebsite) {
    //   error(`Duplicate website: ${row.ws}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubWebsite.name,
    //     liIgnored: row.li,
    //     liSaved: dubWebsite.li,
    //     fbIgnored: row.fb,
    //     fbSaved: dubWebsite.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubWebsite.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubWebsite.reasons,
    //   });

    //   // return [];
    // } else if (dubFb) {
    //   error(`Duplicate Facebook: ${row.fb}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubFb.name,
    //     liIgnored: row.li,
    //     liSaved: dubFb.li,
    //     twIgnored: row.tw,
    //     twSaved: dubFb.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubFb.reasons,
    //   });
    //   // return [];
    // } else if (dubLi) {
    //   error(`Duplicate LinkedIn: ${row.li}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubLi.name,
    //     fbIgnored: row.fb,
    //     fbSaved: dubLi.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubLi.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubLi.reasons,
    //   });
    //   // return [];
    // } else if (dubTw) {
    //   error(`Duplicate Twitter: ${row.tw}`, {
    //     nameIgnored: row.name,
    //     nameSaved: dubTw.name,
    //     fbIgnored: row.fb,
    //     fbSaved: dubTw.fb,
    //     twIgnored: row.tw,
    //     twSaved: dubTw.tw,
    //     reasonsIgnored: row.reasons,
    //     reasonsSaved: dubTw.reasons,
    //   });
    //   // return [];
    // } else {
    // tmpArr.push(row);

    return [row];
    // }
  });

  const manuallyUpdatedArray = deDubeArray.map((row) => {
    const result = manualOverrides.find(([name]) => name === row.name);

    row.tw = row.tw
      ?.replace("www.twitter.com", "x.com")
      ?.replace("twitter.com", "x.com");

    row.li = row.li?.replace("/company-beta/", "/company/");

    if (row.ws) {
      row.ws = getMainDomain(row.ws);
    }

    if (result) {
      log(`Manually updated ${row.name}`);
      return { ...row, ...result[1] };
    } else {
      return row;
    }
  });

  const sortedArray = manuallyUpdatedArray.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  saveJsonToFile(sortedArray, outputFilePath);
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`);

  return sortedArray;
};

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8");
  log(`Data successfully written to ${outputFilePath}`);
};

// function areDuplicates(
//   row1: ScrappedItemType,
//   row2: ScrappedItemType,
// ): boolean {
//   const keysToCompare: (keyof ScrappedItemType)[] = [
//     // "name",
//     "id",
//     "li",
//     "ws",
//     "fb",
//     "tw",
//   ];
//   return keysToCompare.some(
//     (key) => row1[key] && row2[key] && row1[key] === row2[key],
//   );
// }

export async function run() {
  return loadJsonFiles(folderPath);
}
