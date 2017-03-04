# Static render
Static render is an app that does server side render of your Webiny React app and produces a static HTML snapshot.

The app only kicks in when a bot visits the site and it works only if the site is in `production` mode.

## Reason behind this app
We use Webiny, which is a React based platform, to build both websites as well as web applications. For web applications it doesn’t really matter, but for  **websites**, it's important that they  can be properly indexed by bots and other crawlers.

Google claims that their bot can read and execute JavaScript, which is true, but only partially. There are some limitations, which are not documented and we are not certain what they are exactly. But we know that there are some because some of our pages were not indexed properly or not indexed at all, which is bad for us and our customers.

Another reason for building this app is that other search engines, like Bing, Yahoo, Baidu, DuckDuckGo and others, they don’t execute JS at all. And finally, sharing a JS page on Facebook or Twitter, just doesn’t work.

## Dependencies
This is a Webiny app, meaning you need to use Webiny platform as the foundation for your website to use this application. To learn more about Webiny, head over to [http://www.webiny.com/](http://www.webiny.com/)

Additionally you need to have the following items:
* PhantomJs 2.5.0 or greater
* Node 7 or greater

### PhantomJs 2.5.0
At the point of writing this file, Phantom 2.5.0-beta was released. From that version onwards PhantomJs supports ES6, which is a pre-requirement for Webiny apps to run and therefore to render them correctly.

Installing the 2.5.0-beta is bit tricky, but if you run Ubuntu, here are few step you need to get it installed:

1. Download the binary from this link:
[https://bitbucket.org/ariya/phantomjs/downloads/](https://bitbucket.org/ariya/phantomjs/downloads/)

Extract the archive:
```
tar -zxvf {archive name here}
```

Run the install scripts
```
sudo add-apt-repository ppa:ubuntu-toolchain-r/test

sudo apt-get update

sudo apt-get install libstdc++6 libwebp-dev libhyphen-dev libicu-dev gcc-4.9 g++-4.9

sudo mv phantomjs-2.5.0-beta-ubuntu-trusty /usr/local/share/

sudo ln -sf /usr/local/share/phantomjs-2.5.0-beta-ubuntu-trusty/bin/phantomjs /usr/local/bin

sudo ln -sf /usr/local/share/phantomjs-2.5.0-beta-ubuntu-trusty/bin/phantomjs /usr/bin

phantomjs —version
```

## Configuration
The app has few config parameters. Here is a sample config and the explanation below:

```yaml
Application:
    StaticRender:
        Settings:
            ResourceTimeout: 1000
            CacheTtl: 86400
            PathToPhantomJs: '/usr/local/bin/phantomjs'
            PathToNode: '/home/vagrant/.nvm/versions/node/v7.7.1/bin/node'
```

`ResourceTimeout`
Defines how log to wait before taking the snapshot of the DOM.
If you see that some of your components are not loading, try increasing the number.
The number is in milliseconds.

 `CacheTtl`
Once a snapshot is created, it is cached and this number defines for how long. The number is in seconds.

`PathToPhantomJs`
This is the path to PhantomJs executable. If you installed PhantomJs using the steps in the previous section, you can set the path to the value that’s in the sample config.

`PathToNode`
This is path to your node executable. If you made couple of updates to your node installation, the app might run an older version of node, depending on how your paths are set. By forcing a specific path to the node app, you can make sure it executes the commands using the latest node version.

## Features
The app also has a user interface. Using the interface via the Webiny administration you can access additional features. Those features are:
* List of all the cached URLs
* Option to delete a certain cache entry
* Force a refresh of a particular cache entry
* View the rendered HTML content of a certain cache entry
* Fetch as bot view

## License and Contributions

Contributing > Feel free to send PRs.

License > [MIT](LICENSE)