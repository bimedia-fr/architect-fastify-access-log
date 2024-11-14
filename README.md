# architect-fastify-access-log
Access logger for architect fastify

### Installation

```sh
npm install --save architect-fastify-access-log
```

### Usage

Boot [Architect](https://github.com/c9/architect) :

```js
var path = require('path');
var architect = require("architect");

var config = architect.loadConfig(path.join(__dirname, "config.js"));

architect.createApp(config, function (err, app) {
    if (err) {
        throw err;
    }
    console.log("app ready");
});
```

Configure logging with Architect `config.js` :

```js
module.exports = [{
    packagePath: "architect-access-log",
    fmt: 'url=":url" method=":method" statusCode=":statusCode" delta=":delta" ip=":ip"'
}, './services'];
```
