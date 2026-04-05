const GD_PAUSE_KIND = {
  REPLAY: "pauseReplay",
  RESUME: "pauseResume",
  MENU: "pauseMenu"
};
const GD_END_KIND = {
  REPLAY: "endReplay",
  MENU: "endMenu"
};
const GD_REGISTRY = {
  PAUSE_RETURN_FADE_IN: "pauseReturnFadeIn",
  FADE_IN_FROM_BLACK: "fadeInFromBlack"
};
const GD_SCENE_FADE_MS = {
  PAUSE_MENU_OUT: 250,
  PAUSE_MENU_IN: 250,
  END_MENU_OUT: 400,
  END_MENU_IN: 400
};

const GD_INFO_CREDITS_YOUTUBE_URL = "https://www.youtube.com/watch?v=JhKyKEDxo8Q";

const GD_MENU_STORE_DOWNLOADS = [{
  key: "downloadSteam_001",
  url: "https://store.steampowered.com/app/322170/Geometry_Dash"
}, {
  key: "downloadGoogle_001",
  url: "https://play.google.com/store/apps/details?id=com.robtopx.geometryjump&hl=en"
}, {
  key: "downloadApple_001",
  url: "https://apps.apple.com/us/app/geometry-dash/id625334537"
}];

const GD_END_SCREEN_DOWNLOADS = [{
  key: "downloadApple_001",
  url: "https://apps.apple.com/us/app/geometry-dash/id625334537"
}, {
  key: "downloadGoogle_001",
  url: "https://play.google.com/store/apps/details?id=com.robtopx.geometryjump&hl=en"
}, {
  key: "downloadSteam_001",
  url: "https://store.steampowered.com/app/322170/Geometry_Dash"
}];

const GD_PAUSE_ROW_BUTTONS = [{
  frame: "GJ_replayBtn_001.png",
  kind: GD_PAUSE_KIND.REPLAY
}, {
  frame: "GJ_playBtn2_001.png",
  kind: GD_PAUSE_KIND.RESUME
}, {
  frame: "GJ_menuBtn_001.png",
  kind: GD_PAUSE_KIND.MENU
}];

const GD_END_SCREEN_ACTION_BUTTONS = [{
  frame: "GJ_replayBtn_001.png",
  dx: -200,
  kind: GD_END_KIND.REPLAY
}, {
  frame: "GJ_menuBtn_001.png",
  dx: 200,
  kind: GD_END_KIND.MENU
}];
