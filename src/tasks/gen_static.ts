import fs from "fs";
import path from "path";
import { ManualItemSchema, ScrappedFileType } from "../types";
import { log, cleanWebsite } from "../helper";
import { BDS } from "../static_data/BDS";

const outputFilePath = path.join(
  __dirname,
  "../../results/1_batches/static/MANUAL.json",
);

const injectStaticRows = () => {
  const merged: ScrappedFileType = [];

  for (const item of BDS) {
    const safeItem = ManualItemSchema.parse(item);

    const { name, reasons, ws, li, fb, tw } = safeItem;

    for (const [index, website] of ws.entries()) {
      const _website = cleanWebsite(website) as string;

      merged.push({
        name,
        reasons,
        ws: _website,
        id: `s_ws_${name}_${index}`,
      });
    }

    if (li) {
      for (const [index, linkedIn] of li.entries()) {
        if (linkedIn) {
          merged.push({
            name,
            reasons,
            li: cleanWebsite(linkedIn),
            ws: "",
            id: `s_li_${name}_${index}`,
          });
        }
      }
    }

    if (fb) {
      for (const [index, facebook] of fb.entries()) {
        if (facebook) {
          merged.push({
            name,
            reasons,
            fb: cleanWebsite(facebook),
            ws: "",
            id: `s_fb_${name}_${index}`,
          });
        }
      }
    }

    if (tw) {
      for (const [index, twitter] of tw.entries()) {
        if (twitter) {
          merged.push({
            name,
            reasons,
            tw: cleanWebsite(twitter),
            ws: "",
            id: `s_tw_${name}_${index}`,
          });
        }
      }
    }
  }

  const sortedArray = merged.sort((a, b) => a.name.localeCompare(b.name));

  saveJsonToFile(sortedArray, outputFilePath);
  log(`Wrote ${sortedArray.length} rows to ${outputFilePath}...`);

  return sortedArray;
};

const saveJsonToFile = (data: unknown, outputFilePath: string) => {
  fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), "utf-8");
  log(`Data successfully written to ${outputFilePath}`);
};

export async function run() {
  injectStaticRows();
}
