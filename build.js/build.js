'use strict';
console.log(`build start: ${new Date()}`);
const process = require("process");
const child_process = require("child_process");
const fs = require("fs");
const makePath = (...path) => path.map(i => undefined !== i ? i: "").join("").replace(/\/\.\//gm, "/");
const fget = (path) => fs.readFileSync(path, { encoding: "utf-8" });
const evalValue = (base, value) =>
{
    if ("string" === typeof value)
    {
        return value;
    }
    else
    if ("string" === typeof value.path)
    {
        return fget(value.path);
    }
    else
    if ("string" === typeof value.resource)
    {
        const resource = require(makePath(base, value.resource));
        return Object.keys(resource)
            .map(id => `<div id="${id}">${fget(makePath(value.base, resource[id])).replace(/[\w\W]*(<svg)/g, "$1")}</div>`)
            .join("");
    }
    else
    if (undefined !== value.call)
    {
        if ("timestamp" === value.call)
        {
            return `${new Date()}`;
        }
        else
        {
            console.error(`unknown call: ${key}: ${JSON.stringify(value)}`);
        }
    }
    else
    {
        console.error(`unknown parameter: ${key}: ${JSON.stringify(value)}`);
    }
    return null;
};
const jsonPath = process.argv[2];
const base = jsonPath.replace(/\/[^\/]+$/, "/");
const json = require(jsonPath);
try
{
    (json.preprocesses[process.argv[3] || "default"] || [ ]).forEach
    (
        command =>
        {
            console.log(command);
            child_process.execSync
            (
                command,
                {
                    stdio: [ "inherit", "inherit", "inherit" ]
                }
            );
        }
    );
}
catch
{
    process.exit(-1);
}
const template = evalValue(base, json.template);
Object.keys(json.parameters).forEach
(
    key =>
    {
        if (template === template.replace(new RegExp(key, "g"), ""))
        {
            console.error(`${key} not found in ${JSON.stringify(json.template)}.`);
        }
    }
);
fs.writeFileSync
(
    json.output.path,
    Object.keys(json.parameters).map
    (
        key => ({ key, work: evalValue(base, json.parameters[key]) })
    )
    .reduce
    (
        (r, p) => "string" === typeof p.work ? r.replace(new RegExp(p.key, "g"), p.work): r,
        template
    )
)
console.log(`build end: ${new Date()}`);

// how to run: `node ./build.js`
