### **Rocket League React HUD for [LHM.gg](http://LHM.gg)**

Rocket League React HUD for [LHM.gg](http://LHM.gg), created by Lexogrine, is an open source Rocket League HUD that you can use and modify to your needs. It’s the core element of building customized Rocket League HUDs and spectator overlays for the [LHM.gg](http://LHM.gg) platform.

It comes with a set of default options and features that you can use for creating your unique esport experience.

**Preview**  
![Preview of HUDs panel in action](preview.png)

**Download**  
To download it, simply click here: [**DOWNLOAD Rocket League React HUD for LHM.gg**](https://lhm.gg/download?target=rl)

**Instruction**

##### **Setting up**

Fork this repo, clone it, and then run `npm install` and `npm start`. HUD should start on the 3500 port. For this to work, have [LHM.gg](http://LHM.gg) open so it will pass Rocket League data to the HUD.

##### **Identifying HUD**

In `/public` directory, edit `hud.json` so it fits you \- fill HUD's name, author, version, specify the radar and killfeed functionalities. At the end, replace the `thumb.png` with your icon :)

**Building & distributing**  
To build a version to distribute and move around, in the root directory, run `npm run pack`. It will create the zip file for distribution. Now you can just drag and drop this file into the [LHM.gg](http://LHM.gg) upload area.

**File structure**  
The HUD is separated into two parts \- the API part, which connects to the [LHM.gg](http://LHM.gg) API and communicates with it: `src/App.tsx` file and `src/api` directory. Usually, you don't want to play with it, so the whole thing runs without a problem. The second part is the render part \- `src/HUD`, `src/fonts` and `src/assets` are the directories you want to modify. In the `src/HUD` each element of the HUD is separated into its own folder. Styles are kept in the `src/HUD/styles`. Names are quite self-explanatory, and to modify the style of the element, you should just find the styling by the file and class name.

**About Lexogrine**  
[Lexogrine](http://lexogrine.com) is an AI software development company, offering top-tier AI, web, and mobile design and development services for international companies. Alongside that, Lexogrine offers a set of web and mobile applications \- including [LHM.gg](http://LHM.gg) \- that revolutionize the way experts and specialists from different industries work together on a daily basis.

[Lexogrine](http://lexogrine.com) specializes in AI development, alongside web, mobile, and cloud development with technologies like TypeScript, Python, LLM, React, React Native, Node.js, Prisma, Medusa, Pytorch, AWS, and Google Cloud Platform.

With over 5 years of experience, Lexogrine delivered hundreds of projects, supporting companies and enterprises from all over the world.
