// parses bmfont .fnt text and registers a phaser bitmap font from the atlas texture
function registerBitmapFontFromFnt(scene, textureKey, fntText) {
  const atlasTexture = scene.textures.get(textureKey);
  const imageSource = atlasTexture.source[0];
  const texWidth = imageSource.width;
  const texHeight = imageSource.height;
  const fontData = {
    font: textureKey,
    size: 0,
    lineHeight: 0,
    chars: {}
  };
  const kerningPairs = [];
  for (const lineStr of fntText.split("\n")) {
    const tokens = lineStr.trim().split(/\s+/);
    if (!tokens.length) {
      continue;
    }
    const tag = tokens[0];
    const vO199 = {};
    for (let ti = 1; ti < tokens.length; ti++) {
      const eqIdx = tokens[ti].indexOf("=");
      if (eqIdx >= 0) {
        vO199[tokens[ti].slice(0, eqIdx)] = tokens[ti].slice(eqIdx + 1).replace(/^"|"$/g, "");
      }
    }
    if (tag === "info") {
      fontData.size = parseInt(vO199.size, 10);
    } else if (tag === "common") {
      fontData.lineHeight = parseInt(vO199.lineHeight, 10);
    } else if (tag === "char") {
      const vParseInt17 = parseInt(vO199.id, 10);
      const vParseInt18 = parseInt(vO199.x, 10);
      const vParseInt19 = parseInt(vO199.y, 10);
      const vParseInt20 = parseInt(vO199.width, 10);
      const vParseInt21 = parseInt(vO199.height, 10);
      const texU0 = vParseInt18 / texWidth;
      const texV0 = vParseInt19 / texHeight;
      const texU1 = (vParseInt18 + vParseInt20) / texWidth;
      const texV1 = (vParseInt19 + vParseInt21) / texHeight;
      fontData.chars[vParseInt17] = {
        x: vParseInt18,
        y: vParseInt19,
        width: vParseInt20,
        height: vParseInt21,
        centerX: Math.floor(vParseInt20 / 2),
        centerY: Math.floor(vParseInt21 / 2),
        xOffset: parseInt(vO199.xoffset, 10),
        yOffset: parseInt(vO199.yoffset, 10),
        xAdvance: parseInt(vO199.xadvance, 10),
        data: {},
        kerning: {},
        u0: texU0,
        v0: texV0,
        u1: texU1,
        v1: texV1
      };
      if (vParseInt20 !== 0 && vParseInt21 !== 0) {
        const charStr = String.fromCharCode(vParseInt17);
        const charFrame = atlasTexture.add(charStr, 0, vParseInt18, vParseInt19, vParseInt20, vParseInt21);
        if (charFrame) {
          charFrame.setUVs(vParseInt20, vParseInt21, texU0, texV0, texU1, texV1);
        }
      }
    } else if (tag === "kerning") {
      kerningPairs.push({
        first: parseInt(vO199.first, 10),
        second: parseInt(vO199.second, 10),
        amount: parseInt(vO199.amount, 10)
      });
    }
  }
  for (const kp of kerningPairs) {
    if (fontData.chars[kp.second]) {
      fontData.chars[kp.second].kerning[kp.first] = kp.amount;
    }
  }
  scene.cache.bitmapFont.add(textureKey, {
    data: fontData,
    texture: textureKey,
    frame: null
  });
}
