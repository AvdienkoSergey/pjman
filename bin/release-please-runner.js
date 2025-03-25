import dotenv from "dotenv";
import process from "process";
import { exec } from "child_process";

function releasePleaseRunner(command) {
  dotenv.config();

  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_TARGET_BRANCH } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_TARGET_BRANCH) {
    throw new Error(
      "GITHUB_TOKEN and GITHUB_REPO and GITHUB_TARGET_BRANCH must be set"
    );
  }

  const _command =
    `npx release-please ${command} ` +
    `--token=${GITHUB_TOKEN} ` +
    `--repo-url=${GITHUB_REPO} ` +
    `--release-type=node ` +
    `--target-branch=${GITHUB_TARGET_BRANCH}`;

  return new Promise((resolve, reject) => {
    exec(_command, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      console.log(error);
      resolve({ error, stdout, stderr });
    });
  });
}

export { releasePleaseRunner };
