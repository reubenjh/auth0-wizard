const readline = require("readline");
const fs = require("fs");
const config = require("./config.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

if (process.env.AUTH0_TENANT_NAME === "TODO_INPUT_PRODUCTION_ENV_NAME") {
  console.log(
    "Please be aware that you are about to run this script against the production tenant."
  );
}

rl.question(
  `Are you sure you want to continue with tenant ${process.env.AUTH0_TENANT_NAME}? (y/n) `,
  (answer) => {
    if (answer.toLowerCase() === "y") {
      console.log("Proceeding with the operation...");
      fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
    } else {
      console.log("Operation aborted.");
      process.exit(0);
    }

    rl.close();
  }
);
