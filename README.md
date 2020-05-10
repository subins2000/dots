# Vett

[Play the Game Here!](//vett.space)

When we were kids, we used to play Dots & Boxes game (called As `Poojyam Vett` (പൂജ്യം വെട്ട്) in our local language Malayalam) in school. It's still a popular game in school : https://en.wikipedia.org/wiki/Dots_and_Boxes

This is that game made online. It's an online multiplayer implementation of Dots-and-Boxes !

Built with VueJS, d3.js, [P2PT](//github.com/subins2000/p2pt). Uses WebTorrent trackers for making Peer-to-Peer connections for multiplayer.

## Build Setup

```
yarn install
yarn start
```

Trackers list is included in `src/components/Game.vue`. You may want to change that or add your own [local tracker](https://github.com/subins2000/p2pt/blob/master/startTracker.js) for development.

## Thanks

* Sounds
  * [tmkappelt](https://freesound.org/people/tmkappelt/sounds/85702/) - CC0 license
  * [shinephoenixstormcrow](https://freesound.org/people/shinephoenixstormcrow/sounds/337049/) - CC-BY license
  * [LittleRobotSoundFactory](https://freesound.org/people/LittleRobotSoundFactory/sounds/270404/) - CC-BY license
