#!/usr/bin/env node
import { argv, stdin, stdout, stderr } from "node:process";
import { ConfigParser } from "../lib/index.js";

let indent = undefined;
for (let i = 2; i < argv.length; i += 2) {
  if (argv[i].startsWith("--")) {
    const key = argv[i].substring(2);
    const val = argv[i + 1];
    switch (key) {
      case "indent":
        indent = Number(val);
        break;
      default:
        throw new Error(`Unknown option: ${key}`);
    }
  }
}

let data = "";
stdin.on("data", (chunk) => {
  data += chunk;
});
stdin.on("end", () => {
  try {
    const result = ConfigParser.parseIni(data);
    stdout.write(JSON.stringify(result, null, indent));
    stdout.write("\n");
  } catch (err) {
    stderr.write(err.constructor.name + ": ");
    stderr.write(err.message);
    stderr.write("\n");
  }
});
stdin.setEncoding("utf8");
stdin.resume();
