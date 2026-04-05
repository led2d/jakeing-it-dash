const s = t(e ? i.exports : (e = 1, i.exports = (() => {
  var vO2 = globalThis.__GD_MODULE_MAP;
  var vO197 = {};
  function f161(p13979) {
    var cached = vO197[p13979];
    if (cached !== undefined) {
      return cached.exports;
    }
    var moduleRecord = vO197[p13979] = {
      exports: {}
    };
    vO2[p13979](moduleRecord, moduleRecord.exports, f161);
    return moduleRecord.exports;
  }
  f161.g = function () {
    if (typeof globalThis == "object") {
      return globalThis;
    }
    try {
      return this || new Function("return this")();
    } catch (e16) {
      if (typeof window == "object") {
        return window;
      }
    }
  }();
  return f161(85454);
})()));
