# Nibiru.js
---

Nibiru.js is MC framework for modern web applications based on express and mongoose. `M` is a model, `C` is a 
controller. That is. There is no Views. Nibiru.js focus on data model and the way it being processed by front-end. 
There is no big things behind, just some rules to organize your back-end application.


## Install
Install via [npm](https://www.npmjs.com/package/nibiru)
```bash
$ npm install --save nibiru
```


## Usage

Start app by sending application root directory to nibiru. Nibiru.js function returns vanilla bluebird Promise

```js
var nibiru = require('nibiru');

nibiru('./app').then(function(core){

    // some additional setup

}).catch(function(err){

    // handle bootloading error
    console.error(err);
    process.exit(1);

});
```


## App structure

Application in therms of Nibiru.js slices on Configs, Services, Models and Controllers.
Typically your application directory should looks like:
```
app
┣ config
┣ controllers
┣ models
┗ services
```
All app components must exports function that will be called on bootloading state, lets call it `loader` function
```js
module.exports = function () {
    // return something useful
    return {};
};
```


### Configs

Config is config.js file placed in *app/config* directory. Loader of configs accepts single 
argument - app directory. This is useful for example for defining a resources path.
```js
/** app/config/config.js */
 
var path = require('path');

module.exports = function (base) {
    return {
        some_file_path: path.join(base, "path/to/file.txt")
    };
};
```
For handling different apps stages (develop, production), Nibiru.js bootloader looks in `process.env.mode` property 
for string that indicate stage. If mode is present, bootloader will try to extend default config with config 
from *app/configs/ **mode** /config.js*

There is mandatory fields that config must contains:
```
mongo: {
     host: "database_host",
     user: "database_user",
     pass: "database_user_password",
     database: "database_name"
},
server: {
     "port": 7051,
     "host": "host"
}
```


### Services

Service is an utility peace of code that loads and stores in core. Service location is *app/services* directory. By 
experience we know that utility modules often represented in more than one file, even directories. For this reasons 
it was necessary to integrate naming conventions: service file name must ends with *\*service.js* or *\*Service.js*. 

Services available by low-cased, underscored name without *\*service.js* suffix. Service can be grouped in subdirectories and will 
be available by dot represented path.
```
app
┗ services
    ┣ utils
    ┃   ┗ MD5Service.js
    ┗ FileService.js
```
In example above bootloader will load two services with names 'file' and 'utils.md5' respectively.

Service loader accepts config argument - application config loaded in previous bootloading state.


### Models

Models in Nibiru.js is mongoose models. They are located in *app/models* directory. Loader of model accepts `core` argument. 
Core argument is in object created for component communication. Application config available on `core.config` property 
and services can be retrieved by 
calling `core.service(name)` method.
```js
/** app/models/User.js */

var Schema = require('mongoose').Schema;

module.exports = function (core) {
    
    return new Schema({
        name: {
            type: String,
            default: core.config.default_name // refer to config 
        },
        avatar: {
            type: String
        },
        region: {
            type: Schema.Types.ObjectId,
            ref: 'region',
            childPath: 'users'
        },
        type: {
            type: Number,
            default: 1
        },
        registerDate: {
            type: Date,
            default: core.service('utils').now // refer to now method of utils service
        }
    });
};
```
Bootloader automatically install [mongoose-deep-populate](https://www.npmjs.com/package/mongoose-deep-populate) plugin. 
Also [mongoose-relationship](https://www.npmjs.com/package/mongoose-relationship) plugin will be installed on models 
who has fields with `childPath` option. 

Name of model sets to underscored, low-cased basename of file.


### Controllers

Controllers are business logic containers mapped to urls that located in *app/controllers* directory. Loader of controller 
also accepts core argument, but for now, models can be accessed by calling `core.model('name')` method. Loader must return 
object with *method* fields. Additional controller object can contain '&#64;method' field to specify http method and '&#64;route' 
to specify custom route for this controller (custom route must contains :method parameter).

Structure of *app/controllers* directory mapped to routes. For example this structure
```
app
┗ controllers
    ┣ files
    ┃   ┣ controller.js
    ┃   ┗ index.js      // index.js always points to directory contains file
    ┗ files.js
```
will be mapped to
```
/files/:method
/files/controller/:method
/files/:method
```


### Application file

App root directory must contains app.js file. Loader of app file also accepts core parameter and must return express 
application.

Example:
```js
/** app/app.js */

var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

module.exports = function (core) {

    var app = express();

    app.use(compression({threshold: 0}));
    app.use(logger('dev'));
    app.use(bodyParser.json({limit: '32mb'}));
    app.use(bodyParser.urlencoded({extended: false}));
    
    return app; // important!
};
```


## Bonus Track

After bootloader finished loading models, it mount RESTful router to get base CRUD functionality. There are some routes:
```
GET     /api/:model_name        // get all models
GET     /api/:model_name/:_id   // get model by id
POST    /api/:model_name        // create new model
PUT     /api/:model_name/:_id   // update existing model
DELETE  /api/:model_name/:id    // delete existing model
```


## So what about views?

As you can guess, there are no things that can stop you to use Views with Nibiru.js. You can use express build-in views 
mechanism. For little bit of aesthetics, place your views in *app/views* directory and point express to use it by calling
```js
app.set('views', core.base('views'));
```
[More info about views in express](http://expressjs.com/en/guide/using-template-engines.html) 