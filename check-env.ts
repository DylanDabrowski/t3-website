const env = process.env;

console.log("Checking for exposed environment variables...");

for (const key in env) {
  if (env.hasOwnProperty(key) && env[key] === "") {
    console.warn(`Exposed environment variable: ${key}`);
  }
}

console.log("Done!");
