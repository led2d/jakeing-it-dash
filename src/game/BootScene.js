class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene"
    });
  }
  preload() {
    setSceneRenderZoom(this);
    (function (game) {
      if (game.renderer.type === Phaser.WEBGL) {
        let gl = game.renderer.gl;
        blendAdditive = game.renderer.addBlendMode([gl.SRC_ALPHA, gl.ONE], gl.FUNC_ADD);
        blendNormal = game.renderer.addBlendMode([gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA], gl.FUNC_ADD);
      }
    })(this.game);
    const camWidth = gameWidth;
    const camHeight = gameHeight;
    let barWidth = camWidth * 0.6;
    let progressBar = this.add.rectangle(camWidth / 2, camHeight / 2, barWidth, 8, 65280).setOrigin(0.5, 0.5);
    progressBar.scaleX = 0;
    this.load.on("progress", loadRatio => {
      progressBar.scaleX = loadRatio;
    });
    this._hdStandaloneKeys = spriteQuality === "hd" ? new Set(["game_bg_01", "sliderBar", "square04_001", "GJ_square02"]) : new Set();
    this.load.on("loaderror", file => {
      if (spriteQuality !== "hd" || !file) {
        return;
      }
      const url = file.url || "";
      if (file.key === "bigFontFnt" && url.indexOf("-hd.fnt") >= 0) {
        this.load.text("bigFontFnt", "assets/fonts/bigFont.fnt");
        this.load.image("bigFont", "assets/fonts/bigFont.png");
        this.load.start();
        return;
      }
      if (file.key === "goldFontFnt" && url.indexOf("-hd.fnt") >= 0) {
        this.load.text("goldFontFnt", "assets/fonts/goldFont.fnt");
        this.load.image("goldFont", "assets/fonts/goldFont.png");
        this.load.start();
        return;
      }
      if (file.type !== "image") {
        return;
      }
      if (file.key === "GJ_WebSheet") {
        return;
      }
      if (!url || url.indexOf("-hd.") < 0) {
        return;
      }
      const ldUrl = url.replace("-hd.", ".");
      if (ldUrl === url) {
        return;
      }
      if (file.key === "bigFont") {
        this.load.image("bigFont", ldUrl);
        this.load.text("bigFontFnt", "assets/fonts/bigFont.fnt");
        this.load.start();
        return;
      }
      if (file.key === "goldFont") {
        this.load.image("goldFont", ldUrl);
        this.load.text("goldFontFnt", "assets/fonts/goldFont.fnt");
        this.load.start();
        return;
      }
      if (this._hdStandaloneKeys) {
        this._hdStandaloneKeys.delete(file.key);
      }
      this.load.image(file.key, ldUrl);
      this.load.start();
    });

    // paths for all non-script assets, make sure to change this when renaming anything!
    let gjAtlasData = loadJsonSync("assets/data/GJ_WebSheet.json");
    if (spriteQuality === "hd") {gjAtlasData = scaleAtlasJsonForDoubleResolution(gjAtlasData)}
    this.load.atlas("GJ_WebSheet", imagePathForSpriteQuality("assets/images/GJ_WebSheet.png"), gjAtlasData);
    this.load.image("bigFont", imagePathForSpriteQuality("assets/fonts/bigFont.png"));
    this.load.text("bigFontFnt", fontFntPathForSpriteQuality("assets/fonts/bigFont.fnt"));
    this.load.image("goldFont", imagePathForSpriteQuality("assets/fonts/goldFont.png"));
    this.load.text("goldFontFnt", fontFntPathForSpriteQuality("assets/fonts/goldFont.fnt"));
    this.load.image("game_bg_01", imagePathForSpriteQuality("assets/images/game_bg_01_001.png"));
    this.load.image("sliderBar", imagePathForSpriteQuality("assets/images/sliderBar.png"));
    this.load.image("square04_001", imagePathForSpriteQuality("assets/images/square04_001.png"));
    this.load.image("GJ_square02", imagePathForSpriteQuality("assets/images/GJ_square02.png"));
    this.load.text("level_1", "assets/data/level.txt");
    this.load.json("gjObjects", "assets/data/objects.json");
    this.load.audio("stereo_madness", "assets/audio/StereoMadness.mp3");
    this.load.audio("explode_11", "assets/audio/explode_11.ogg");
    this.load.audio("endStart_02", "assets/audio/endStart_02.ogg");
    this.load.audio("playSound_01", "assets/audio/playSound_01.ogg");
    this.load.audio("quitSound_01", "assets/audio/quitSound_01.ogg");
    this.load.audio("highscoreGet02", "assets/audio/highscoreGet02.ogg");

  }
  create() {
    applyHdTextureSizeFixes(this);
    initobjectsFromJson(this.cache.json.get("gjObjects"));
    this.cache.text.get("level_1");
    const bigFontFntText = this.cache.text.get("bigFontFnt");
    if (bigFontFntText) {
      registerBitmapFontFromFnt(this, "bigFont", bigFontFntText);
    }
    const goldFontFntText = this.cache.text.get("goldFontFnt");
    if (goldFontFntText) {
      registerBitmapFontFromFnt(this, "goldFont", goldFontFntText);
    }
    this.scene.start("GameScene");
  }
}
