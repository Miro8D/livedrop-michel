import { performanceStats } from "../server.js";
import fs from "fs";
import yaml from "js-yaml";

import { classifyIntent } from "./intent-classifier.js";

const prompts = yaml.load(fs.readFileSync("../../../docs/prompts.yaml", "utf8"));
const knowledgeBase = JSON.parse(fs.readFileSync("../../../docs/ground-truth.json", "utf8"));

const intent = classifyIntent(userMessage);
console.log("Detected intent:", intent);


async function callLLM(prompt) {
  const start = performance.now();
  const response = await fetch(`${process.env.LLM_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const data = await response.json();
  const duration = performance.now() - start;
  performanceStats.llmResponseTimes.push(duration);
  return data;
}