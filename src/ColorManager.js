// rgb tweens for level palette slots (COLOR_ID_BACKGROUND / COLOR_ID_GROUND from color triggers)
class ColorManager {
  constructor() {
    this.reset();
  }
  reset() {
    this._colors = {
      [COLOR_ID_BACKGROUND]: {
        r: 0,
        g: 102,
        b: 255
      },
      [COLOR_ID_GROUND]: {
        r: 0,
        g: 68,
        b: 170
      }
    };
    this._actions = {};
  }
  triggerColor(p14309, p14310, p14311) {
    let fromRgb = {
      ...this.getColor(p14309)
    };
    this._actions[p14309] = new RgbColorTween(fromRgb, p14310, p14311);
    if (p14311 <= 0) {
      this._colors[p14309] = {
        ...p14310
      };
    }
  }
  step(p14312) {
    for (let colorId in this._actions) {
      let tween = this._actions[colorId];
      tween.step(p14312);
      this._colors[colorId] = {
        ...tween.current
      };
      if (tween.done) {
        delete this._actions[colorId];
      }
    }
  }
  getColor(p14313) {
    return this._colors[p14313] || {
      r: 255,
      g: 255,
      b: 255
    };
  }
  getHex(p14314) {
    let rgb = this.getColor(p14314);
    return rgb.r << 16 | rgb.g << 8 | rgb.b;
  }
}
