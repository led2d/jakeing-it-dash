// lots of zlib stuff, a lot wasn't deobfucated to not break anything
// just know the game-relevant code - parseCompressedGjLevelString, parseGjLevelObjectRecord
function deflateZeroBuf(p13999) {
  let v7578 = p13999.length;
  while (--v7578 >= 0) {
    p13999[v7578] = 0;
  }
}
const DEFLATE_LIT_MAX = 256;
const DEFLATE_L_CODES = 286;
const DEFLATE_D_CODES = 30;
const DEFLATE_MAX_BITS = 15;
const deflateExtraLbits = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]);
const deflateExtraDbits = new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
const deflateExtraBlbits = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]);
const deflateBlOrder = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
const deflateStaticLtree = new Array(576);
deflateZeroBuf(deflateStaticLtree);
const deflateStaticDtree = new Array(60);
deflateZeroBuf(deflateStaticDtree);
const deflateDistLookup = new Array(512);
deflateZeroBuf(deflateDistLookup);
const deflateLenLookup = new Array(256);
deflateZeroBuf(deflateLenLookup);
const deflateLengthBase = new Array(29);
deflateZeroBuf(deflateLengthBase);
const deflateDistExtra = new Array(DEFLATE_D_CODES);
function DeflateStaticTreeDesc(p14000, p14001, p14002, p14003, p14004) {
  this.static_tree = p14000;
  this.extra_bits = p14001;
  this.extra_base = p14002;
  this.elems = p14003;
  this.max_length = p14004;
  this.has_stree = p14000 && p14000.length;
}
let deflateLintDesc;
let deflateDistDesc;
let deflateBlDesc;
function DeflateTreeDesc(p14005, p14006) {
  this.dyn_tree = p14005;
  this.max_code = 0;
  this.stat_desc = p14006;
}
deflateZeroBuf(deflateDistExtra);
const deflateDistCode = p14007 => p14007 < 256 ? deflateDistLookup[p14007] : deflateDistLookup[256 + (p14007 >>> 7)];
const deflatePutShort = (p14008, p14009) => {
  p14008.pending_buf[p14008.pending++] = p14009 & 255;
  p14008.pending_buf[p14008.pending++] = p14009 >>> 8 & 255;
};
const deflateSendBits = (p14010, p14011, p14012) => {
  if (p14010.bi_valid > 16 - p14012) {
    p14010.bi_buf |= p14011 << p14010.bi_valid & 65535;
    deflatePutShort(p14010, p14010.bi_buf);
    p14010.bi_buf = p14011 >> 16 - p14010.bi_valid;
    p14010.bi_valid += p14012 - 16;
  } else {
    p14010.bi_buf |= p14011 << p14010.bi_valid & 65535;
    p14010.bi_valid += p14012;
  }
};
const deflateSendCode = (p14013, p14014, p14015) => {
  deflateSendBits(p14013, p14015[p14014 * 2], p14015[p14014 * 2 + 1]);
};
const deflateBiReverse = (p14016, p14017) => {
  let vLN0880 = 0;
  do {
    vLN0880 |= p14016 & 1;
    p14016 >>>= 1;
    vLN0880 <<= 1;
  } while (--p14017 > 0);
  return vLN0880 >>> 1;
};
const deflateGenCodes = (p14018, p14019, p14020) => {
  const v7579 = new Array(16);
  let v7580;
  let v7581;
  let vLN0881 = 0;
  for (v7580 = 1; v7580 <= DEFLATE_MAX_BITS; v7580++) {
    vLN0881 = vLN0881 + p14020[v7580 - 1] << 1;
    v7579[v7580] = vLN0881;
  }
  for (v7581 = 0; v7581 <= p14019; v7581++) {
    let v7582 = p14018[v7581 * 2 + 1];
    if (v7582 !== 0) {
      p14018[v7581 * 2] = deflateBiReverse(v7579[v7582]++, v7582);
    }
  }
};
const deflateResetTrees = p14021 => {
  let v7583;
  for (v7583 = 0; v7583 < DEFLATE_L_CODES; v7583++) {
    p14021.dyn_ltree[v7583 * 2] = 0;
  }
  for (v7583 = 0; v7583 < DEFLATE_D_CODES; v7583++) {
    p14021.dyn_dtree[v7583 * 2] = 0;
  }
  for (v7583 = 0; v7583 < 19; v7583++) {
    p14021.bl_tree[v7583 * 2] = 0;
  }
  p14021.dyn_ltree[512] = 1;
  p14021.opt_len = p14021.static_len = 0;
  p14021.sym_next = p14021.matches = 0;
};
const deflateBiFlush = p14022 => {
  if (p14022.bi_valid > 8) {
    deflatePutShort(p14022, p14022.bi_buf);
  } else if (p14022.bi_valid > 0) {
    p14022.pending_buf[p14022.pending++] = p14022.bi_buf;
  }
  p14022.bi_buf = 0;
  p14022.bi_valid = 0;
};
const deflateHeapLess = (p14023, p14024, p14025, p14026) => {
  const v7584 = p14024 * 2;
  const v7585 = p14025 * 2;
  return p14023[v7584] < p14023[v7585] || p14023[v7584] === p14023[v7585] && p14026[p14024] <= p14026[p14025];
};
const deflateHeapSift = (p14027, p14028, p14029) => {
  const v7586 = p14027.heap[p14029];
  let v7587 = p14029 << 1;
  while (v7587 <= p14027.heap_len && (v7587 < p14027.heap_len && deflateHeapLess(p14028, p14027.heap[v7587 + 1], p14027.heap[v7587], p14027.depth) && v7587++, !deflateHeapLess(p14028, v7586, p14027.heap[v7587], p14027.depth))) {
    p14027.heap[p14029] = p14027.heap[v7587];
    p14029 = v7587;
    v7587 <<= 1;
  }
  p14027.heap[p14029] = v7586;
};
const deflateFlushCompressed = (p14030, p14031, p14032) => {
  let v7588;
  let v7589;
  let v7590;
  let v7591;
  let vLN0882 = 0;
  if (p14030.sym_next !== 0) {
    do {
      v7588 = p14030.pending_buf[p14030.sym_buf + vLN0882++] & 255;
      v7588 += (p14030.pending_buf[p14030.sym_buf + vLN0882++] & 255) << 8;
      v7589 = p14030.pending_buf[p14030.sym_buf + vLN0882++];
      if (v7588 === 0) {
        deflateSendCode(p14030, v7589, p14031);
      } else {
        v7590 = deflateLenLookup[v7589];
        deflateSendCode(p14030, v7590 + DEFLATE_LIT_MAX + 1, p14031);
        v7591 = deflateExtraLbits[v7590];
        if (v7591 !== 0) {
          v7589 -= deflateLengthBase[v7590];
          deflateSendBits(p14030, v7589, v7591);
        }
        v7588--;
        v7590 = deflateDistCode(v7588);
        deflateSendCode(p14030, v7590, p14032);
        v7591 = deflateExtraDbits[v7590];
        if (v7591 !== 0) {
          v7588 -= deflateDistExtra[v7590];
          deflateSendBits(p14030, v7588, v7591);
        }
      }
    } while (vLN0882 < p14030.sym_next);
  }
  deflateSendCode(p14030, 256, p14031);
};
const deflateBuildTree = (p14033, p14034) => {
  const v7592 = p14034.dyn_tree;
  const v7593 = p14034.stat_desc.static_tree;
  const v7594 = p14034.stat_desc.has_stree;
  const v7595 = p14034.stat_desc.elems;
  let v7596;
  let v7597;
  let v7598;
  let v7599 = -1;
  p14033.heap_len = 0;
  p14033.heap_max = 573;
  v7596 = 0;
  for (; v7596 < v7595; v7596++) {
    if (v7592[v7596 * 2] !== 0) {
      p14033.heap[++p14033.heap_len] = v7599 = v7596;
      p14033.depth[v7596] = 0;
    } else {
      v7592[v7596 * 2 + 1] = 0;
    }
  }
  while (p14033.heap_len < 2) {
    v7598 = p14033.heap[++p14033.heap_len] = v7599 < 2 ? ++v7599 : 0;
    v7592[v7598 * 2] = 1;
    p14033.depth[v7598] = 0;
    p14033.opt_len--;
    if (v7594) {
      p14033.static_len -= v7593[v7598 * 2 + 1];
    }
  }
  p14034.max_code = v7599;
  v7596 = p14033.heap_len >> 1;
  for (; v7596 >= 1; v7596--) {
    deflateHeapSift(p14033, v7592, v7596);
  }
  v7598 = v7595;
  do {
    v7596 = p14033.heap[1];
    p14033.heap[1] = p14033.heap[p14033.heap_len--];
    deflateHeapSift(p14033, v7592, 1);
    v7597 = p14033.heap[1];
    p14033.heap[--p14033.heap_max] = v7596;
    p14033.heap[--p14033.heap_max] = v7597;
    v7592[v7598 * 2] = v7592[v7596 * 2] + v7592[v7597 * 2];
    p14033.depth[v7598] = (p14033.depth[v7596] >= p14033.depth[v7597] ? p14033.depth[v7596] : p14033.depth[v7597]) + 1;
    v7592[v7596 * 2 + 1] = v7592[v7597 * 2 + 1] = v7598;
    p14033.heap[1] = v7598++;
    deflateHeapSift(p14033, v7592, 1);
  } while (p14033.heap_len >= 2);
  p14033.heap[--p14033.heap_max] = p14033.heap[1];
  ((p14035, p14036) => {
    const v7600 = p14036.dyn_tree;
    const v7601 = p14036.max_code;
    const v7602 = p14036.stat_desc.static_tree;
    const v7603 = p14036.stat_desc.has_stree;
    const v7604 = p14036.stat_desc.extra_bits;
    const v7605 = p14036.stat_desc.extra_base;
    const v7606 = p14036.stat_desc.max_length;
    let v7607;
    let v7608;
    let v7609;
    let v7610;
    let v7611;
    let v7612;
    let vLN0883 = 0;
    for (v7610 = 0; v7610 <= DEFLATE_MAX_BITS; v7610++) {
      p14035.bl_count[v7610] = 0;
    }
    v7600[p14035.heap[p14035.heap_max] * 2 + 1] = 0;
    v7607 = p14035.heap_max + 1;
    for (; v7607 < 573; v7607++) {
      v7608 = p14035.heap[v7607];
      v7610 = v7600[v7600[v7608 * 2 + 1] * 2 + 1] + 1;
      if (v7610 > v7606) {
        v7610 = v7606;
        vLN0883++;
      }
      v7600[v7608 * 2 + 1] = v7610;
      if (!(v7608 > v7601)) {
        p14035.bl_count[v7610]++;
        v7611 = 0;
        if (v7608 >= v7605) {
          v7611 = v7604[v7608 - v7605];
        }
        v7612 = v7600[v7608 * 2];
        p14035.opt_len += v7612 * (v7610 + v7611);
        if (v7603) {
          p14035.static_len += v7612 * (v7602[v7608 * 2 + 1] + v7611);
        }
      }
    }
    if (vLN0883 !== 0) {
      do {
        for (v7610 = v7606 - 1; p14035.bl_count[v7610] === 0;) {
          v7610--;
        }
        p14035.bl_count[v7610]--;
        p14035.bl_count[v7610 + 1] += 2;
        p14035.bl_count[v7606]--;
        vLN0883 -= 2;
      } while (vLN0883 > 0);
      for (v7610 = v7606; v7610 !== 0; v7610--) {
        for (v7608 = p14035.bl_count[v7610]; v7608 !== 0;) {
          v7609 = p14035.heap[--v7607];
          if (!(v7609 > v7601)) {
            if (v7600[v7609 * 2 + 1] !== v7610) {
              p14035.opt_len += (v7610 - v7600[v7609 * 2 + 1]) * v7600[v7609 * 2];
              v7600[v7609 * 2 + 1] = v7610;
            }
            v7608--;
          }
        }
      }
    }
  })(p14033, p14034);
  deflateGenCodes(v7592, v7599, p14033.bl_count);
};
const deflateScanTreeCounts = (p14037, p14038, p14039) => {
  let v7613;
  let v7614;
  let v7615 = -1;
  let v7616 = p14038[1];
  let vLN0884 = 0;
  let vLN7 = 7;
  let vLN42 = 4;
  if (v7616 === 0) {
    vLN7 = 138;
    vLN42 = 3;
  }
  p14038[(p14039 + 1) * 2 + 1] = 65535;
  v7613 = 0;
  for (; v7613 <= p14039; v7613++) {
    v7614 = v7616;
    v7616 = p14038[(v7613 + 1) * 2 + 1];
    if (!(++vLN0884 < vLN7) || v7614 !== v7616) {
      if (vLN0884 < vLN42) {
        p14037.bl_tree[v7614 * 2] += vLN0884;
      } else if (v7614 !== 0) {
        if (v7614 !== v7615) {
          p14037.bl_tree[v7614 * 2]++;
        }
        p14037.bl_tree[32]++;
      } else if (vLN0884 <= 10) {
        p14037.bl_tree[34]++;
      } else {
        p14037.bl_tree[36]++;
      }
      vLN0884 = 0;
      v7615 = v7614;
      if (v7616 === 0) {
        vLN7 = 138;
        vLN42 = 3;
      } else if (v7614 === v7616) {
        vLN7 = 6;
        vLN42 = 3;
      } else {
        vLN7 = 7;
        vLN42 = 4;
      }
    }
  }
};
const deflateSendTree = (p14040, p14041, p14042) => {
  let v7617;
  let v7618;
  let v7619 = -1;
  let v7620 = p14041[1];
  let vLN0885 = 0;
  let vLN72 = 7;
  let vLN43 = 4;
  if (v7620 === 0) {
    vLN72 = 138;
    vLN43 = 3;
  }
  v7617 = 0;
  for (; v7617 <= p14042; v7617++) {
    v7618 = v7620;
    v7620 = p14041[(v7617 + 1) * 2 + 1];
    if (!(++vLN0885 < vLN72) || v7618 !== v7620) {
      if (vLN0885 < vLN43) {
        do {
          deflateSendCode(p14040, v7618, p14040.bl_tree);
        } while (--vLN0885 !== 0);
      } else if (v7618 !== 0) {
        if (v7618 !== v7619) {
          deflateSendCode(p14040, v7618, p14040.bl_tree);
          vLN0885--;
        }
        deflateSendCode(p14040, 16, p14040.bl_tree);
        deflateSendBits(p14040, vLN0885 - 3, 2);
      } else if (vLN0885 <= 10) {
        deflateSendCode(p14040, 17, p14040.bl_tree);
        deflateSendBits(p14040, vLN0885 - 3, 3);
      } else {
        deflateSendCode(p14040, 18, p14040.bl_tree);
        deflateSendBits(p14040, vLN0885 - 11, 7);
      }
      vLN0885 = 0;
      v7619 = v7618;
      if (v7620 === 0) {
        vLN72 = 138;
        vLN43 = 3;
      } else if (v7618 === v7620) {
        vLN72 = 6;
        vLN43 = 3;
      } else {
        vLN72 = 7;
        vLN43 = 4;
      }
    }
  }
};
let deflateTreesReady = false;
const deflateStoredBlock = (p14043, p14044, p14045, p14046) => {
  deflateSendBits(p14043, 0 + (p14046 ? 1 : 0), 3);
  deflateBiFlush(p14043);
  deflatePutShort(p14043, p14045);
  deflatePutShort(p14043, ~p14045);
  if (p14045) {
    p14043.pending_buf.set(p14043.window.subarray(p14044, p14044 + p14045), p14043.pending);
  }
  p14043.pending += p14045;
};
var deflateTreeOps = {
  _tr_init: p14047 => {
    if (!deflateTreesReady) {
      (() => {
        let v7621;
        let v7622;
        let v7623;
        let v7624;
        let v7625;
        const v7626 = new Array(16);
        v7623 = 0;
        v7624 = 0;
        for (; v7624 < 28; v7624++) {
          deflateLengthBase[v7624] = v7623;
          v7621 = 0;
          for (; v7621 < 1 << deflateExtraLbits[v7624]; v7621++) {
            deflateLenLookup[v7623++] = v7624;
          }
        }
        deflateLenLookup[v7623 - 1] = v7624;
        v7625 = 0;
        v7624 = 0;
        for (; v7624 < 16; v7624++) {
          deflateDistExtra[v7624] = v7625;
          v7621 = 0;
          for (; v7621 < 1 << deflateExtraDbits[v7624]; v7621++) {
            deflateDistLookup[v7625++] = v7624;
          }
        }
        for (v7625 >>= 7; v7624 < DEFLATE_D_CODES; v7624++) {
          deflateDistExtra[v7624] = v7625 << 7;
          v7621 = 0;
          for (; v7621 < 1 << deflateExtraDbits[v7624] - 7; v7621++) {
            deflateDistLookup[256 + v7625++] = v7624;
          }
        }
        for (v7622 = 0; v7622 <= DEFLATE_MAX_BITS; v7622++) {
          v7626[v7622] = 0;
        }
        for (v7621 = 0; v7621 <= 143;) {
          deflateStaticLtree[v7621 * 2 + 1] = 8;
          v7621++;
          v7626[8]++;
        }
        while (v7621 <= 255) {
          deflateStaticLtree[v7621 * 2 + 1] = 9;
          v7621++;
          v7626[9]++;
        }
        while (v7621 <= 279) {
          deflateStaticLtree[v7621 * 2 + 1] = 7;
          v7621++;
          v7626[7]++;
        }
        while (v7621 <= 287) {
          deflateStaticLtree[v7621 * 2 + 1] = 8;
          v7621++;
          v7626[8]++;
        }
        deflateGenCodes(deflateStaticLtree, 287, v7626);
        v7621 = 0;
        for (; v7621 < DEFLATE_D_CODES; v7621++) {
          deflateStaticDtree[v7621 * 2 + 1] = 5;
          deflateStaticDtree[v7621 * 2] = deflateBiReverse(v7621, 5);
        }
        deflateLintDesc = new DeflateStaticTreeDesc(deflateStaticLtree, deflateExtraLbits, 257, DEFLATE_L_CODES, DEFLATE_MAX_BITS);
        deflateDistDesc = new DeflateStaticTreeDesc(deflateStaticDtree, deflateExtraDbits, 0, DEFLATE_D_CODES, DEFLATE_MAX_BITS);
        deflateBlDesc = new DeflateStaticTreeDesc(new Array(0), deflateExtraBlbits, 0, 19, 7);
      })();
      deflateTreesReady = true;
    }
    p14047.l_desc = new DeflateTreeDesc(p14047.dyn_ltree, deflateLintDesc);
    p14047.d_desc = new DeflateTreeDesc(p14047.dyn_dtree, deflateDistDesc);
    p14047.bl_desc = new DeflateTreeDesc(p14047.bl_tree, deflateBlDesc);
    p14047.bi_buf = 0;
    p14047.bi_valid = 0;
    deflateResetTrees(p14047);
  },
  _tr_stored_block: deflateStoredBlock,
  _tr_flush_block: (p14048, p14049, p14050, p14051) => {
    let v7627;
    let v7628;
    let vLN0886 = 0;
    if (p14048.level > 0) {
      if (p14048.strm.data_type === 2) {
        p14048.strm.data_type = (p14052 => {
          let v7629;
          let vLN4093624447 = 4093624447;
          for (v7629 = 0; v7629 <= 31; v7629++, vLN4093624447 >>>= 1) {
            if (vLN4093624447 & 1 && p14052.dyn_ltree[v7629 * 2] !== 0) {
              return 0;
            }
          }
          if (p14052.dyn_ltree[18] !== 0 || p14052.dyn_ltree[20] !== 0 || p14052.dyn_ltree[26] !== 0) {
            return 1;
          }
          for (v7629 = 32; v7629 < DEFLATE_LIT_MAX; v7629++) {
            if (p14052.dyn_ltree[v7629 * 2] !== 0) {
              return 1;
            }
          }
          return 0;
        })(p14048);
      }
      deflateBuildTree(p14048, p14048.l_desc);
      deflateBuildTree(p14048, p14048.d_desc);
      vLN0886 = (p14053 => {
        let v7630;
        deflateScanTreeCounts(p14053, p14053.dyn_ltree, p14053.l_desc.max_code);
        deflateScanTreeCounts(p14053, p14053.dyn_dtree, p14053.d_desc.max_code);
        deflateBuildTree(p14053, p14053.bl_desc);
        v7630 = 18;
        for (; v7630 >= 3 && p14053.bl_tree[deflateBlOrder[v7630] * 2 + 1] === 0; v7630--);
        p14053.opt_len += (v7630 + 1) * 3 + 5 + 5 + 4;
        return v7630;
      })(p14048);
      v7627 = p14048.opt_len + 3 + 7 >>> 3;
      v7628 = p14048.static_len + 3 + 7 >>> 3;
      if (v7628 <= v7627) {
        v7627 = v7628;
      }
    } else {
      v7627 = v7628 = p14050 + 5;
    }
    if (p14050 + 4 <= v7627 && p14049 !== -1) {
      deflateStoredBlock(p14048, p14049, p14050, p14051);
    } else if (p14048.strategy === 4 || v7628 === v7627) {
      deflateSendBits(p14048, 2 + (p14051 ? 1 : 0), 3);
      deflateFlushCompressed(p14048, deflateStaticLtree, deflateStaticDtree);
    } else {
      deflateSendBits(p14048, 4 + (p14051 ? 1 : 0), 3);
      ((p14054, p14055, p14056, p14057) => {
        let v7631;
        deflateSendBits(p14054, p14055 - 257, 5);
        deflateSendBits(p14054, p14056 - 1, 5);
        deflateSendBits(p14054, p14057 - 4, 4);
        v7631 = 0;
        for (; v7631 < p14057; v7631++) {
          deflateSendBits(p14054, p14054.bl_tree[deflateBlOrder[v7631] * 2 + 1], 3);
        }
        deflateSendTree(p14054, p14054.dyn_ltree, p14055 - 1);
        deflateSendTree(p14054, p14054.dyn_dtree, p14056 - 1);
      })(p14048, p14048.l_desc.max_code + 1, p14048.d_desc.max_code + 1, vLN0886 + 1);
      deflateFlushCompressed(p14048, p14048.dyn_ltree, p14048.dyn_dtree);
    }
    deflateResetTrees(p14048);
    if (p14051) {
      deflateBiFlush(p14048);
    }
  },
  _tr_tally: (p14058, p14059, p14060) => {
    p14058.pending_buf[p14058.sym_buf + p14058.sym_next++] = p14059;
    p14058.pending_buf[p14058.sym_buf + p14058.sym_next++] = p14059 >> 8;
    p14058.pending_buf[p14058.sym_buf + p14058.sym_next++] = p14060;
    if (p14059 === 0) {
      p14058.dyn_ltree[p14060 * 2]++;
    } else {
      p14058.matches++;
      p14059--;
      p14058.dyn_ltree[(deflateLenLookup[p14060] + DEFLATE_LIT_MAX + 1) * 2]++;
      p14058.dyn_dtree[deflateDistCode(p14059) * 2]++;
    }
    return p14058.sym_next === p14058.sym_end;
  },
  _tr_align: p14061 => {
    deflateSendBits(p14061, 2, 3);
    deflateSendCode(p14061, 256, deflateStaticLtree);
    (p14062 => {
      if (p14062.bi_valid === 16) {
        deflatePutShort(p14062, p14062.bi_buf);
        p14062.bi_buf = 0;
        p14062.bi_valid = 0;
      } else if (p14062.bi_valid >= 8) {
        p14062.pending_buf[p14062.pending++] = p14062.bi_buf & 255;
        p14062.bi_buf >>= 8;
        p14062.bi_valid -= 8;
      }
    })(p14061);
  }
};
var zlibAdler32 = (p14063, p14064, p14065, p14066) => {
  let v7632 = p14063 & 65535;
  let v7633 = p14063 >>> 16 & 65535;
  let vLN0887 = 0;
  while (p14065 !== 0) {
    vLN0887 = p14065 > 2000 ? 2000 : p14065;
    p14065 -= vLN0887;
    do {
      v7632 = v7632 + p14064[p14066++] | 0;
      v7633 = v7633 + v7632 | 0;
    } while (--vLN0887);
    v7632 %= 65521;
    v7633 %= 65521;
  }
  return v7632 | v7633 << 16;
};
const crc32Table = new Uint32Array((() => {
  let v7634;
  let vA238 = [];
  for (var vLN0888 = 0; vLN0888 < 256; vLN0888++) {
    v7634 = vLN0888;
    for (var vLN0889 = 0; vLN0889 < 8; vLN0889++) {
      v7634 = v7634 & 1 ? v7634 >>> 1 ^ -306674912 : v7634 >>> 1;
    }
    vA238[vLN0888] = v7634;
  }
  return vA238;
})());
var zlibCrc32 = (p14067, p14068, p14069, p14070) => {
  const vMt = crc32Table;
  const v7635 = p14070 + p14069;
  p14067 ^= -1;
  for (let vP14070 = p14070; vP14070 < v7635; vP14070++) {
    p14067 = p14067 >>> 8 ^ vMt[(p14067 ^ p14068[vP14070]) & 255];
  }
  return p14067 ^ -1;
};
var zlibErrMsgs = {
  2: "need dictionary",
  1: "stream end",
  0: "",
  "-1": "file error",
  "-2": "stream error",
  "-3": "data error",
  "-4": "insufficient memory",
  "-5": "buffer error",
  "-6": "incompatible version"
};
var zlibConstants = {
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  Z_MEM_ERROR: -4,
  Z_BUF_ERROR: -5,
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  Z_BINARY: 0,
  Z_TEXT: 1,
  Z_UNKNOWN: 2,
  Z_DEFLATED: 8
};
const {
  _tr_init: deflateTrInit,
  _tr_stored_block: deflateTrStoredBlock,
  _tr_flush_block: deflateTrFlushBlock,
  _tr_tally: deflateTrTally,
  _tr_align: deflateTrAlign
} = deflateTreeOps;
const {
  Z_NO_FLUSH: At,
  Z_PARTIAL_FLUSH: Ct,
  Z_FULL_FLUSH: Mt,
  Z_FINISH: Pt,
  Z_BLOCK: Rt,
  Z_OK: Lt,
  Z_STREAM_END: Ot,
  Z_STREAM_ERROR: Ft,
  Z_DATA_ERROR: Dt,
  Z_BUF_ERROR: kt,
  Z_DEFAULT_COMPRESSION: It,
  Z_FILTERED: Bt,
  Z_HUFFMAN_ONLY: Nt,
  Z_RLE: Xt,
  Z_FIXED: Yt,
  Z_DEFAULT_STRATEGY: Ut,
  Z_UNKNOWN: zt,
  Z_DEFLATED: Gt
} = zlibConstants;
const Wt = 258;
const Vt = 262;
const Ht = 42;
const jt = 113;
const qt = 666;
const zlibAttachStreamMsg = (p14071, p14072) => {
  p14071.msg = zlibErrMsgs[p14072];
  return p14072;
};
const Zt = p14073 => p14073 * 2 - (p14073 > 4 ? 9 : 0);
const Jt = p14074 => {
  let v7636 = p14074.length;
  while (--v7636 >= 0) {
    p14074[v7636] = 0;
  }
};
const Qt = p14075 => {
  let v7637;
  let v7638;
  let v7639;
  let v7640 = p14075.w_size;
  v7637 = p14075.hash_size;
  v7639 = v7637;
  do {
    v7638 = p14075.head[--v7639];
    p14075.head[v7639] = v7638 >= v7640 ? v7638 - v7640 : 0;
  } while (--v7637);
  v7637 = v7640;
  v7639 = v7637;
  do {
    v7638 = p14075.prev[--v7639];
    p14075.prev[v7639] = v7638 >= v7640 ? v7638 - v7640 : 0;
  } while (--v7637);
};
let $t = (p14076, p14077, p14078) => (p14077 << p14076.hash_shift ^ p14078) & p14076.hash_mask;
const zlibCopyPendingToOutput = p14079 => {
  const v7641 = p14079.state;
  let v7642 = v7641.pending;
  if (v7642 > p14079.avail_out) {
    v7642 = p14079.avail_out;
  }
  if (v7642 !== 0) {
    p14079.output.set(v7641.pending_buf.subarray(v7641.pending_out, v7641.pending_out + v7642), p14079.next_out);
    p14079.next_out += v7642;
    v7641.pending_out += v7642;
    p14079.total_out += v7642;
    p14079.avail_out -= v7642;
    v7641.pending -= v7642;
    if (v7641.pending === 0) {
      v7641.pending_out = 0;
    }
  }
};
const zlibFlushDeflateBlock = (p14080, p14081) => {
  deflateTrFlushBlock(p14080, p14080.block_start >= 0 ? p14080.block_start : -1, p14080.strstart - p14080.block_start, p14081);
  p14080.block_start = p14080.strstart;
  zlibCopyPendingToOutput(p14080.strm);
};
const zlibPendingWriteByte = (p14082, p14083) => {
  p14082.pending_buf[p14082.pending++] = p14083;
};
const zlibPendingWriteUint16BE = (p14084, p14085) => {
  p14084.pending_buf[p14084.pending++] = p14085 >>> 8 & 255;
  p14084.pending_buf[p14084.pending++] = p14085 & 255;
};
const zlibCopyInputToWindow = (p14086, p14087, p14088, p14089) => {
  let v7643 = p14086.avail_in;
  if (v7643 > p14089) {
    v7643 = p14089;
  }
  if (v7643 === 0) {
    return 0;
  } else {
    p14086.avail_in -= v7643;
    p14087.set(p14086.input.subarray(p14086.next_in, p14086.next_in + v7643), p14088);
    if (p14086.state.wrap === 1) {
      p14086.adler = zlibAdler32(p14086.adler, p14087, v7643, p14088);
    } else if (p14086.state.wrap === 2) {
      p14086.adler = zlibCrc32(p14086.adler, p14087, v7643, p14088);
    }
    p14086.next_in += v7643;
    p14086.total_in += v7643;
    return v7643;
  }
};
const zlibLongestMatch = (p14090, p14091) => {
  let v7644;
  let v7645;
  let v7646 = p14090.max_chain_length;
  let v7647 = p14090.strstart;
  let v7648 = p14090.prev_length;
  let v7649 = p14090.nice_match;
  const v7650 = p14090.strstart > p14090.w_size - Vt ? p14090.strstart - (p14090.w_size - Vt) : 0;
  const v7651 = p14090.window;
  const v7652 = p14090.w_mask;
  const v7653 = p14090.prev;
  const v7654 = p14090.strstart + Wt;
  let v7655 = v7651[v7647 + v7648 - 1];
  let v7656 = v7651[v7647 + v7648];
  if (p14090.prev_length >= p14090.good_match) {
    v7646 >>= 2;
  }
  if (v7649 > p14090.lookahead) {
    v7649 = p14090.lookahead;
  }
  do {
    v7644 = p14091;
    if (v7651[v7644 + v7648] === v7656 && v7651[v7644 + v7648 - 1] === v7655 && v7651[v7644] === v7651[v7647] && v7651[++v7644] === v7651[v7647 + 1]) {
      v7647 += 2;
      v7644++;
      do {} while (v7651[++v7647] === v7651[++v7644] && v7651[++v7647] === v7651[++v7644] && v7651[++v7647] === v7651[++v7644] && v7651[++v7647] === v7651[++v7644] && v7651[++v7647] === v7651[++v7644] && v7651[++v7647] === v7651[++v7644] && v7651[++v7647] === v7651[++v7644] && v7651[++v7647] === v7651[++v7644] && v7647 < v7654);
      v7645 = Wt - (v7654 - v7647);
      v7647 = v7654 - Wt;
      if (v7645 > v7648) {
        p14090.match_start = p14091;
        v7648 = v7645;
        if (v7645 >= v7649) {
          break;
        }
        v7655 = v7651[v7647 + v7648 - 1];
        v7656 = v7651[v7647 + v7648];
      }
    }
  } while ((p14091 = v7653[p14091 & v7652]) > v7650 && --v7646 !== 0);
  if (v7648 <= p14090.lookahead) {
    return v7648;
  } else {
    return p14090.lookahead;
  }
};
const ae = p14092 => {
  const v7657 = p14092.w_size;
  let v7658;
  let v7659;
  let v7660;
  do {
    v7659 = p14092.window_size - p14092.lookahead - p14092.strstart;
    if (p14092.strstart >= v7657 + (v7657 - Vt)) {
      p14092.window.set(p14092.window.subarray(v7657, v7657 + v7657 - v7659), 0);
      p14092.match_start -= v7657;
      p14092.strstart -= v7657;
      p14092.block_start -= v7657;
      if (p14092.insert > p14092.strstart) {
        p14092.insert = p14092.strstart;
      }
      Qt(p14092);
      v7659 += v7657;
    }
    if (p14092.strm.avail_in === 0) {
      break;
    }
    v7658 = zlibCopyInputToWindow(p14092.strm, p14092.window, p14092.strstart + p14092.lookahead, v7659);
    p14092.lookahead += v7658;
    if (p14092.lookahead + p14092.insert >= 3) {
      v7660 = p14092.strstart - p14092.insert;
      p14092.ins_h = p14092.window[v7660];
      p14092.ins_h = $t(p14092, p14092.ins_h, p14092.window[v7660 + 1]);
      while (p14092.insert && (p14092.ins_h = $t(p14092, p14092.ins_h, p14092.window[v7660 + 3 - 1]), p14092.prev[v7660 & p14092.w_mask] = p14092.head[p14092.ins_h], p14092.head[p14092.ins_h] = v7660, v7660++, p14092.insert--, !(p14092.lookahead + p14092.insert < 3)));
    }
  } while (p14092.lookahead < Vt && p14092.strm.avail_in !== 0);
};
const oe = (p14093, p14094) => {
  let v7661;
  let v7662;
  let v7663;
  let v7664 = p14093.pending_buf_size - 5 > p14093.w_size ? p14093.w_size : p14093.pending_buf_size - 5;
  let vLN0890 = 0;
  let v7665 = p14093.strm.avail_in;
  do {
    v7661 = 65535;
    v7663 = p14093.bi_valid + 42 >> 3;
    if (p14093.strm.avail_out < v7663) {
      break;
    }
    v7663 = p14093.strm.avail_out - v7663;
    v7662 = p14093.strstart - p14093.block_start;
    if (v7661 > v7662 + p14093.strm.avail_in) {
      v7661 = v7662 + p14093.strm.avail_in;
    }
    if (v7661 > v7663) {
      v7661 = v7663;
    }
    if (v7661 < v7664 && (v7661 === 0 && p14094 !== Pt || p14094 === At || v7661 !== v7662 + p14093.strm.avail_in)) {
      break;
    }
    vLN0890 = p14094 === Pt && v7661 === v7662 + p14093.strm.avail_in ? 1 : 0;
    deflateTrStoredBlock(p14093, 0, 0, vLN0890);
    p14093.pending_buf[p14093.pending - 4] = v7661;
    p14093.pending_buf[p14093.pending - 3] = v7661 >> 8;
    p14093.pending_buf[p14093.pending - 2] = ~v7661;
    p14093.pending_buf[p14093.pending - 1] = ~v7661 >> 8;
    zlibCopyPendingToOutput(p14093.strm);
    if (v7662) {
      if (v7662 > v7661) {
        v7662 = v7661;
      }
      p14093.strm.output.set(p14093.window.subarray(p14093.block_start, p14093.block_start + v7662), p14093.strm.next_out);
      p14093.strm.next_out += v7662;
      p14093.strm.avail_out -= v7662;
      p14093.strm.total_out += v7662;
      p14093.block_start += v7662;
      v7661 -= v7662;
    }
    if (v7661) {
      zlibCopyInputToWindow(p14093.strm, p14093.strm.output, p14093.strm.next_out, v7661);
      p14093.strm.next_out += v7661;
      p14093.strm.avail_out -= v7661;
      p14093.strm.total_out += v7661;
    }
  } while (vLN0890 === 0);
  v7665 -= p14093.strm.avail_in;
  if (v7665) {
    if (v7665 >= p14093.w_size) {
      p14093.matches = 2;
      p14093.window.set(p14093.strm.input.subarray(p14093.strm.next_in - p14093.w_size, p14093.strm.next_in), 0);
      p14093.strstart = p14093.w_size;
      p14093.insert = p14093.strstart;
    } else {
      if (p14093.window_size - p14093.strstart <= v7665) {
        p14093.strstart -= p14093.w_size;
        p14093.window.set(p14093.window.subarray(p14093.w_size, p14093.w_size + p14093.strstart), 0);
        if (p14093.matches < 2) {
          p14093.matches++;
        }
        if (p14093.insert > p14093.strstart) {
          p14093.insert = p14093.strstart;
        }
      }
      p14093.window.set(p14093.strm.input.subarray(p14093.strm.next_in - v7665, p14093.strm.next_in), p14093.strstart);
      p14093.strstart += v7665;
      p14093.insert += v7665 > p14093.w_size - p14093.insert ? p14093.w_size - p14093.insert : v7665;
    }
    p14093.block_start = p14093.strstart;
  }
  if (p14093.high_water < p14093.strstart) {
    p14093.high_water = p14093.strstart;
  }
  if (vLN0890) {
    return 4;
  } else if (p14094 !== At && p14094 !== Pt && p14093.strm.avail_in === 0 && p14093.strstart === p14093.block_start) {
    return 2;
  } else {
    v7663 = p14093.window_size - p14093.strstart;
    if (p14093.strm.avail_in > v7663 && p14093.block_start >= p14093.w_size) {
      p14093.block_start -= p14093.w_size;
      p14093.strstart -= p14093.w_size;
      p14093.window.set(p14093.window.subarray(p14093.w_size, p14093.w_size + p14093.strstart), 0);
      if (p14093.matches < 2) {
        p14093.matches++;
      }
      v7663 += p14093.w_size;
      if (p14093.insert > p14093.strstart) {
        p14093.insert = p14093.strstart;
      }
    }
    if (v7663 > p14093.strm.avail_in) {
      v7663 = p14093.strm.avail_in;
    }
    if (v7663) {
      zlibCopyInputToWindow(p14093.strm, p14093.window, p14093.strstart, v7663);
      p14093.strstart += v7663;
      p14093.insert += v7663 > p14093.w_size - p14093.insert ? p14093.w_size - p14093.insert : v7663;
    }
    if (p14093.high_water < p14093.strstart) {
      p14093.high_water = p14093.strstart;
    }
    v7663 = p14093.bi_valid + 42 >> 3;
    v7663 = p14093.pending_buf_size - v7663 > 65535 ? 65535 : p14093.pending_buf_size - v7663;
    v7664 = v7663 > p14093.w_size ? p14093.w_size : v7663;
    v7662 = p14093.strstart - p14093.block_start;
    if (v7662 >= v7664 || (v7662 || p14094 === Pt) && p14094 !== At && p14093.strm.avail_in === 0 && v7662 <= v7663) {
      v7661 = v7662 > v7663 ? v7663 : v7662;
      vLN0890 = p14094 === Pt && p14093.strm.avail_in === 0 && v7661 === v7662 ? 1 : 0;
      deflateTrStoredBlock(p14093, p14093.block_start, v7661, vLN0890);
      p14093.block_start += v7661;
      zlibCopyPendingToOutput(p14093.strm);
    }
    if (vLN0890) {
      return 3;
    } else {
      return 1;
    }
  }
};
const he = (p14095, p14096) => {
  let v7666;
  let v7667;
  while (true) {
    if (p14095.lookahead < Vt) {
      ae(p14095);
      if (p14095.lookahead < Vt && p14096 === At) {
        return 1;
      }
      if (p14095.lookahead === 0) {
        break;
      }
    }
    v7666 = 0;
    if (p14095.lookahead >= 3) {
      p14095.ins_h = $t(p14095, p14095.ins_h, p14095.window[p14095.strstart + 3 - 1]);
      v7666 = p14095.prev[p14095.strstart & p14095.w_mask] = p14095.head[p14095.ins_h];
      p14095.head[p14095.ins_h] = p14095.strstart;
    }
    if (v7666 !== 0 && p14095.strstart - v7666 <= p14095.w_size - Vt) {
      p14095.match_length = zlibLongestMatch(p14095, v7666);
    }
    if (p14095.match_length >= 3) {
      v7667 = deflateTrTally(p14095, p14095.strstart - p14095.match_start, p14095.match_length - 3);
      p14095.lookahead -= p14095.match_length;
      if (p14095.match_length <= p14095.max_lazy_match && p14095.lookahead >= 3) {
        p14095.match_length--;
        do {
          p14095.strstart++;
          p14095.ins_h = $t(p14095, p14095.ins_h, p14095.window[p14095.strstart + 3 - 1]);
          v7666 = p14095.prev[p14095.strstart & p14095.w_mask] = p14095.head[p14095.ins_h];
          p14095.head[p14095.ins_h] = p14095.strstart;
        } while (--p14095.match_length !== 0);
        p14095.strstart++;
      } else {
        p14095.strstart += p14095.match_length;
        p14095.match_length = 0;
        p14095.ins_h = p14095.window[p14095.strstart];
        p14095.ins_h = $t(p14095, p14095.ins_h, p14095.window[p14095.strstart + 1]);
      }
    } else {
      v7667 = deflateTrTally(p14095, 0, p14095.window[p14095.strstart]);
      p14095.lookahead--;
      p14095.strstart++;
    }
    if (v7667 && (zlibFlushDeflateBlock(p14095, false), p14095.strm.avail_out === 0)) {
      return 1;
    }
  }
  p14095.insert = p14095.strstart < 2 ? p14095.strstart : 2;
  if (p14096 === Pt) {
    zlibFlushDeflateBlock(p14095, true);
    if (p14095.strm.avail_out === 0) {
      return 3;
    } else {
      return 4;
    }
  } else if (p14095.sym_next && (zlibFlushDeflateBlock(p14095, false), p14095.strm.avail_out === 0)) {
    return 1;
  } else {
    return 2;
  }
};
const le = (p14097, p14098) => {
  let v7668;
  let v7669;
  let v7670;
  while (true) {
    if (p14097.lookahead < Vt) {
      ae(p14097);
      if (p14097.lookahead < Vt && p14098 === At) {
        return 1;
      }
      if (p14097.lookahead === 0) {
        break;
      }
    }
    v7668 = 0;
    if (p14097.lookahead >= 3) {
      p14097.ins_h = $t(p14097, p14097.ins_h, p14097.window[p14097.strstart + 3 - 1]);
      v7668 = p14097.prev[p14097.strstart & p14097.w_mask] = p14097.head[p14097.ins_h];
      p14097.head[p14097.ins_h] = p14097.strstart;
    }
    p14097.prev_length = p14097.match_length;
    p14097.prev_match = p14097.match_start;
    p14097.match_length = 2;
    if (v7668 !== 0 && p14097.prev_length < p14097.max_lazy_match && p14097.strstart - v7668 <= p14097.w_size - Vt) {
      p14097.match_length = zlibLongestMatch(p14097, v7668);
      if (p14097.match_length <= 5 && (p14097.strategy === Bt || p14097.match_length === 3 && p14097.strstart - p14097.match_start > 4096)) {
        p14097.match_length = 2;
      }
    }
    if (p14097.prev_length >= 3 && p14097.match_length <= p14097.prev_length) {
      v7670 = p14097.strstart + p14097.lookahead - 3;
      v7669 = deflateTrTally(p14097, p14097.strstart - 1 - p14097.prev_match, p14097.prev_length - 3);
      p14097.lookahead -= p14097.prev_length - 1;
      p14097.prev_length -= 2;
      do {
        if (++p14097.strstart <= v7670) {
          p14097.ins_h = $t(p14097, p14097.ins_h, p14097.window[p14097.strstart + 3 - 1]);
          v7668 = p14097.prev[p14097.strstart & p14097.w_mask] = p14097.head[p14097.ins_h];
          p14097.head[p14097.ins_h] = p14097.strstart;
        }
      } while (--p14097.prev_length !== 0);
      p14097.match_available = 0;
      p14097.match_length = 2;
      p14097.strstart++;
      if (v7669 && (zlibFlushDeflateBlock(p14097, false), p14097.strm.avail_out === 0)) {
        return 1;
      }
    } else if (p14097.match_available) {
      v7669 = deflateTrTally(p14097, 0, p14097.window[p14097.strstart - 1]);
      if (v7669) {
        zlibFlushDeflateBlock(p14097, false);
      }
      p14097.strstart++;
      p14097.lookahead--;
      if (p14097.strm.avail_out === 0) {
        return 1;
      }
    } else {
      p14097.match_available = 1;
      p14097.strstart++;
      p14097.lookahead--;
    }
  }
  if (p14097.match_available) {
    v7669 = deflateTrTally(p14097, 0, p14097.window[p14097.strstart - 1]);
    p14097.match_available = 0;
  }
  p14097.insert = p14097.strstart < 2 ? p14097.strstart : 2;
  if (p14098 === Pt) {
    zlibFlushDeflateBlock(p14097, true);
    if (p14097.strm.avail_out === 0) {
      return 3;
    } else {
      return 4;
    }
  } else if (p14097.sym_next && (zlibFlushDeflateBlock(p14097, false), p14097.strm.avail_out === 0)) {
    return 1;
  } else {
    return 2;
  }
};
function ue(p14099, p14100, p14101, p14102, p14103) {
  this.good_length = p14099;
  this.max_lazy = p14100;
  this.nice_length = p14101;
  this.max_chain = p14102;
  this.func = p14103;
}
const ce = [new ue(0, 0, 0, 0, oe), new ue(4, 4, 8, 4, he), new ue(4, 5, 16, 8, he), new ue(4, 6, 32, 32, he), new ue(4, 4, 16, 16, le), new ue(8, 16, 32, 32, le), new ue(8, 16, 128, 128, le), new ue(8, 32, 128, 256, le), new ue(32, 128, 258, 1024, le), new ue(32, 258, 258, 4096, le)];
function de() {
  this.strm = null;
  this.status = 0;
  this.pending_buf = null;
  this.pending_buf_size = 0;
  this.pending_out = 0;
  this.pending = 0;
  this.wrap = 0;
  this.gzhead = null;
  this.gzindex = 0;
  this.method = Gt;
  this.last_flush = -1;
  this.w_size = 0;
  this.w_bits = 0;
  this.w_mask = 0;
  this.window = null;
  this.window_size = 0;
  this.prev = null;
  this.head = null;
  this.ins_h = 0;
  this.hash_size = 0;
  this.hash_bits = 0;
  this.hash_mask = 0;
  this.hash_shift = 0;
  this.block_start = 0;
  this.match_length = 0;
  this.prev_match = 0;
  this.match_available = 0;
  this.strstart = 0;
  this.match_start = 0;
  this.lookahead = 0;
  this.prev_length = 0;
  this.max_chain_length = 0;
  this.max_lazy_match = 0;
  this.level = 0;
  this.strategy = 0;
  this.good_match = 0;
  this.nice_match = 0;
  this.dyn_ltree = new Uint16Array(1146);
  this.dyn_dtree = new Uint16Array(122);
  this.bl_tree = new Uint16Array(78);
  Jt(this.dyn_ltree);
  Jt(this.dyn_dtree);
  Jt(this.bl_tree);
  this.l_desc = null;
  this.d_desc = null;
  this.bl_desc = null;
  this.bl_count = new Uint16Array(16);
  this.heap = new Uint16Array(573);
  Jt(this.heap);
  this.heap_len = 0;
  this.heap_max = 0;
  this.depth = new Uint16Array(573);
  Jt(this.depth);
  this.sym_buf = 0;
  this.lit_bufsize = 0;
  this.sym_next = 0;
  this.sym_end = 0;
  this.opt_len = 0;
  this.static_len = 0;
  this.matches = 0;
  this.insert = 0;
  this.bi_buf = 0;
  this.bi_valid = 0;
}
const pe = p14104 => {
  if (!p14104) {
    return 1;
  }
  const v7671 = p14104.state;
  if (!v7671 || v7671.strm !== p14104 || v7671.status !== Ht && v7671.status !== 57 && v7671.status !== 69 && v7671.status !== 73 && v7671.status !== 91 && v7671.status !== 103 && v7671.status !== jt && v7671.status !== qt) {
    return 1;
  } else {
    return 0;
  }
};
const fe = p14105 => {
  if (pe(p14105)) {
    return zlibAttachStreamMsg(p14105, Ft);
  }
  p14105.total_in = p14105.total_out = 0;
  p14105.data_type = zt;
  const v7672 = p14105.state;
  v7672.pending = 0;
  v7672.pending_out = 0;
  if (v7672.wrap < 0) {
    v7672.wrap = -v7672.wrap;
  }
  v7672.status = v7672.wrap === 2 ? 57 : v7672.wrap ? Ht : jt;
  p14105.adler = v7672.wrap === 2 ? 0 : 1;
  v7672.last_flush = -2;
  deflateTrInit(v7672);
  return Lt;
};
const ge = p14106 => {
  const vFe = fe(p14106);
  var v7673;
  if (vFe === Lt) {
    (v7673 = p14106.state).window_size = v7673.w_size * 2;
    Jt(v7673.head);
    v7673.max_lazy_match = ce[v7673.level].max_lazy;
    v7673.good_match = ce[v7673.level].good_length;
    v7673.nice_match = ce[v7673.level].nice_length;
    v7673.max_chain_length = ce[v7673.level].max_chain;
    v7673.strstart = 0;
    v7673.block_start = 0;
    v7673.lookahead = 0;
    v7673.insert = 0;
    v7673.match_length = v7673.prev_length = 2;
    v7673.match_available = 0;
    v7673.ins_h = 0;
  }
  return vFe;
};
const ve = (p14107, p14108, p14109, p14110, p14111, p14112) => {
  if (!p14107) {
    return Ft;
  }
  let vLN148 = 1;
  if (p14108 === It) {
    p14108 = 6;
  }
  if (p14110 < 0) {
    vLN148 = 0;
    p14110 = -p14110;
  } else if (p14110 > 15) {
    vLN148 = 2;
    p14110 -= 16;
  }
  if (p14111 < 1 || p14111 > 9 || p14109 !== Gt || p14110 < 8 || p14110 > 15 || p14108 < 0 || p14108 > 9 || p14112 < 0 || p14112 > Yt || p14110 === 8 && vLN148 !== 1) {
    return zlibAttachStreamMsg(p14107, Ft);
  }
  if (p14110 === 8) {
    p14110 = 9;
  }
  const v7674 = new de();
  p14107.state = v7674;
  v7674.strm = p14107;
  v7674.status = Ht;
  v7674.wrap = vLN148;
  v7674.gzhead = null;
  v7674.w_bits = p14110;
  v7674.w_size = 1 << v7674.w_bits;
  v7674.w_mask = v7674.w_size - 1;
  v7674.hash_bits = p14111 + 7;
  v7674.hash_size = 1 << v7674.hash_bits;
  v7674.hash_mask = v7674.hash_size - 1;
  v7674.hash_shift = ~~((v7674.hash_bits + 3 - 1) / 3);
  v7674.window = new Uint8Array(v7674.w_size * 2);
  v7674.head = new Uint16Array(v7674.hash_size);
  v7674.prev = new Uint16Array(v7674.w_size);
  v7674.lit_bufsize = 1 << p14111 + 6;
  v7674.pending_buf_size = v7674.lit_bufsize * 4;
  v7674.pending_buf = new Uint8Array(v7674.pending_buf_size);
  v7674.sym_buf = v7674.lit_bufsize;
  v7674.sym_end = (v7674.lit_bufsize - 1) * 3;
  v7674.level = p14108;
  v7674.strategy = p14112;
  v7674.method = p14109;
  return ge(p14107);
};
var deflateAPI = {
  deflateInit: (p14113, p14114) => ve(p14113, p14114, Gt, 15, 8, Ut),
  deflateInit2: ve,
  deflateReset: ge,
  deflateResetKeep: fe,
  deflateSetHeader: (p14115, p14116) => pe(p14115) || p14115.state.wrap !== 2 ? Ft : (p14115.state.gzhead = p14116, Lt),
  deflate: (p14117, p14118) => {
    if (pe(p14117) || p14118 > Rt || p14118 < 0) {
      if (p14117) {
        return zlibAttachStreamMsg(p14117, Ft);
      } else {
        return Ft;
      }
    }
    const v7675 = p14117.state;
    if (!p14117.output || p14117.avail_in !== 0 && !p14117.input || v7675.status === qt && p14118 !== Pt) {
      return zlibAttachStreamMsg(p14117, p14117.avail_out === 0 ? kt : Ft);
    }
    const v7676 = v7675.last_flush;
    v7675.last_flush = p14118;
    if (v7675.pending !== 0) {
      zlibCopyPendingToOutput(p14117);
      if (p14117.avail_out === 0) {
        v7675.last_flush = -1;
        return Lt;
      }
    } else if (p14117.avail_in === 0 && Zt(p14118) <= Zt(v7676) && p14118 !== Pt) {
      return zlibAttachStreamMsg(p14117, kt);
    }
    if (v7675.status === qt && p14117.avail_in !== 0) {
      return zlibAttachStreamMsg(p14117, kt);
    }
    if (v7675.status === Ht && v7675.wrap === 0) {
      v7675.status = jt;
    }
    if (v7675.status === Ht) {
      let v7677 = Gt + (v7675.w_bits - 8 << 4) << 8;
      let v7678 = -1;
      v7678 = v7675.strategy >= Nt || v7675.level < 2 ? 0 : v7675.level < 6 ? 1 : v7675.level === 6 ? 2 : 3;
      v7677 |= v7678 << 6;
      if (v7675.strstart !== 0) {
        v7677 |= 32;
      }
      v7677 += 31 - v7677 % 31;
      zlibPendingWriteUint16BE(v7675, v7677);
      if (v7675.strstart !== 0) {
        zlibPendingWriteUint16BE(v7675, p14117.adler >>> 16);
        zlibPendingWriteUint16BE(v7675, p14117.adler & 65535);
      }
      p14117.adler = 1;
      v7675.status = jt;
      zlibCopyPendingToOutput(p14117);
      if (v7675.pending !== 0) {
        v7675.last_flush = -1;
        return Lt;
      }
    }
    if (v7675.status === 57) {
      p14117.adler = 0;
      zlibPendingWriteByte(v7675, 31);
      zlibPendingWriteByte(v7675, 139);
      zlibPendingWriteByte(v7675, 8);
      if (v7675.gzhead) {
        zlibPendingWriteByte(v7675, (v7675.gzhead.text ? 1 : 0) + (v7675.gzhead.hcrc ? 2 : 0) + (v7675.gzhead.extra ? 4 : 0) + (v7675.gzhead.name ? 8 : 0) + (v7675.gzhead.comment ? 16 : 0));
        zlibPendingWriteByte(v7675, v7675.gzhead.time & 255);
        zlibPendingWriteByte(v7675, v7675.gzhead.time >> 8 & 255);
        zlibPendingWriteByte(v7675, v7675.gzhead.time >> 16 & 255);
        zlibPendingWriteByte(v7675, v7675.gzhead.time >> 24 & 255);
        zlibPendingWriteByte(v7675, v7675.level === 9 ? 2 : v7675.strategy >= Nt || v7675.level < 2 ? 4 : 0);
        zlibPendingWriteByte(v7675, v7675.gzhead.os & 255);
        if (v7675.gzhead.extra && v7675.gzhead.extra.length) {
          zlibPendingWriteByte(v7675, v7675.gzhead.extra.length & 255);
          zlibPendingWriteByte(v7675, v7675.gzhead.extra.length >> 8 & 255);
        }
        if (v7675.gzhead.hcrc) {
          p14117.adler = zlibCrc32(p14117.adler, v7675.pending_buf, v7675.pending, 0);
        }
        v7675.gzindex = 0;
        v7675.status = 69;
      } else {
        zlibPendingWriteByte(v7675, 0);
        zlibPendingWriteByte(v7675, 0);
        zlibPendingWriteByte(v7675, 0);
        zlibPendingWriteByte(v7675, 0);
        zlibPendingWriteByte(v7675, 0);
        zlibPendingWriteByte(v7675, v7675.level === 9 ? 2 : v7675.strategy >= Nt || v7675.level < 2 ? 4 : 0);
        zlibPendingWriteByte(v7675, 3);
        v7675.status = jt;
        zlibCopyPendingToOutput(p14117);
        if (v7675.pending !== 0) {
          v7675.last_flush = -1;
          return Lt;
        }
      }
    }
    if (v7675.status === 69) {
      if (v7675.gzhead.extra) {
        let v7679 = v7675.pending;
        let v7680 = (v7675.gzhead.extra.length & 65535) - v7675.gzindex;
        while (v7675.pending + v7680 > v7675.pending_buf_size) {
          let v7681 = v7675.pending_buf_size - v7675.pending;
          v7675.pending_buf.set(v7675.gzhead.extra.subarray(v7675.gzindex, v7675.gzindex + v7681), v7675.pending);
          v7675.pending = v7675.pending_buf_size;
          if (v7675.gzhead.hcrc && v7675.pending > v7679) {
            p14117.adler = zlibCrc32(p14117.adler, v7675.pending_buf, v7675.pending - v7679, v7679);
          }
          v7675.gzindex += v7681;
          zlibCopyPendingToOutput(p14117);
          if (v7675.pending !== 0) {
            v7675.last_flush = -1;
            return Lt;
          }
          v7679 = 0;
          v7680 -= v7681;
        }
        let v7682 = new Uint8Array(v7675.gzhead.extra);
        v7675.pending_buf.set(v7682.subarray(v7675.gzindex, v7675.gzindex + v7680), v7675.pending);
        v7675.pending += v7680;
        if (v7675.gzhead.hcrc && v7675.pending > v7679) {
          p14117.adler = zlibCrc32(p14117.adler, v7675.pending_buf, v7675.pending - v7679, v7679);
        }
        v7675.gzindex = 0;
      }
      v7675.status = 73;
    }
    if (v7675.status === 73) {
      if (v7675.gzhead.name) {
        let v7683;
        let v7684 = v7675.pending;
        do {
          if (v7675.pending === v7675.pending_buf_size) {
            if (v7675.gzhead.hcrc && v7675.pending > v7684) {
              p14117.adler = zlibCrc32(p14117.adler, v7675.pending_buf, v7675.pending - v7684, v7684);
            }
            zlibCopyPendingToOutput(p14117);
            if (v7675.pending !== 0) {
              v7675.last_flush = -1;
              return Lt;
            }
            v7684 = 0;
          }
          v7683 = v7675.gzindex < v7675.gzhead.name.length ? v7675.gzhead.name.charCodeAt(v7675.gzindex++) & 255 : 0;
          zlibPendingWriteByte(v7675, v7683);
        } while (v7683 !== 0);
        if (v7675.gzhead.hcrc && v7675.pending > v7684) {
          p14117.adler = zlibCrc32(p14117.adler, v7675.pending_buf, v7675.pending - v7684, v7684);
        }
        v7675.gzindex = 0;
      }
      v7675.status = 91;
    }
    if (v7675.status === 91) {
      if (v7675.gzhead.comment) {
        let v7685;
        let v7686 = v7675.pending;
        do {
          if (v7675.pending === v7675.pending_buf_size) {
            if (v7675.gzhead.hcrc && v7675.pending > v7686) {
              p14117.adler = zlibCrc32(p14117.adler, v7675.pending_buf, v7675.pending - v7686, v7686);
            }
            zlibCopyPendingToOutput(p14117);
            if (v7675.pending !== 0) {
              v7675.last_flush = -1;
              return Lt;
            }
            v7686 = 0;
          }
          v7685 = v7675.gzindex < v7675.gzhead.comment.length ? v7675.gzhead.comment.charCodeAt(v7675.gzindex++) & 255 : 0;
          zlibPendingWriteByte(v7675, v7685);
        } while (v7685 !== 0);
        if (v7675.gzhead.hcrc && v7675.pending > v7686) {
          p14117.adler = zlibCrc32(p14117.adler, v7675.pending_buf, v7675.pending - v7686, v7686);
        }
      }
      v7675.status = 103;
    }
    if (v7675.status === 103) {
      if (v7675.gzhead.hcrc) {
        if (v7675.pending + 2 > v7675.pending_buf_size && (zlibCopyPendingToOutput(p14117), v7675.pending !== 0)) {
          v7675.last_flush = -1;
          return Lt;
        }
        zlibPendingWriteByte(v7675, p14117.adler & 255);
        zlibPendingWriteByte(v7675, p14117.adler >> 8 & 255);
        p14117.adler = 0;
      }
      v7675.status = jt;
      zlibCopyPendingToOutput(p14117);
      if (v7675.pending !== 0) {
        v7675.last_flush = -1;
        return Lt;
      }
    }
    if (p14117.avail_in !== 0 || v7675.lookahead !== 0 || p14118 !== At && v7675.status !== qt) {
      let v7687 = v7675.level === 0 ? oe(v7675, p14118) : v7675.strategy === Nt ? ((p14119, p14120) => {
        let v7688;
        while (true) {
          if (p14119.lookahead === 0 && (ae(p14119), p14119.lookahead === 0)) {
            if (p14120 === At) {
              return 1;
            }
            break;
          }
          p14119.match_length = 0;
          v7688 = deflateTrTally(p14119, 0, p14119.window[p14119.strstart]);
          p14119.lookahead--;
          p14119.strstart++;
          if (v7688 && (zlibFlushDeflateBlock(p14119, false), p14119.strm.avail_out === 0)) {
            return 1;
          }
        }
        p14119.insert = 0;
        if (p14120 === Pt) {
          zlibFlushDeflateBlock(p14119, true);
          if (p14119.strm.avail_out === 0) {
            return 3;
          } else {
            return 4;
          }
        } else if (p14119.sym_next && (zlibFlushDeflateBlock(p14119, false), p14119.strm.avail_out === 0)) {
          return 1;
        } else {
          return 2;
        }
      })(v7675, p14118) : v7675.strategy === Xt ? ((p14121, p14122) => {
        let v7689;
        let v7690;
        let v7691;
        let v7692;
        const v7693 = p14121.window;
        while (true) {
          if (p14121.lookahead <= Wt) {
            ae(p14121);
            if (p14121.lookahead <= Wt && p14122 === At) {
              return 1;
            }
            if (p14121.lookahead === 0) {
              break;
            }
          }
          p14121.match_length = 0;
          if (p14121.lookahead >= 3 && p14121.strstart > 0 && (v7691 = p14121.strstart - 1, v7690 = v7693[v7691], v7690 === v7693[++v7691] && v7690 === v7693[++v7691] && v7690 === v7693[++v7691])) {
            v7692 = p14121.strstart + Wt;
            do {} while (v7690 === v7693[++v7691] && v7690 === v7693[++v7691] && v7690 === v7693[++v7691] && v7690 === v7693[++v7691] && v7690 === v7693[++v7691] && v7690 === v7693[++v7691] && v7690 === v7693[++v7691] && v7690 === v7693[++v7691] && v7691 < v7692);
            p14121.match_length = Wt - (v7692 - v7691);
            if (p14121.match_length > p14121.lookahead) {
              p14121.match_length = p14121.lookahead;
            }
          }
          if (p14121.match_length >= 3) {
            v7689 = deflateTrTally(p14121, 1, p14121.match_length - 3);
            p14121.lookahead -= p14121.match_length;
            p14121.strstart += p14121.match_length;
            p14121.match_length = 0;
          } else {
            v7689 = deflateTrTally(p14121, 0, p14121.window[p14121.strstart]);
            p14121.lookahead--;
            p14121.strstart++;
          }
          if (v7689 && (zlibFlushDeflateBlock(p14121, false), p14121.strm.avail_out === 0)) {
            return 1;
          }
        }
        p14121.insert = 0;
        if (p14122 === Pt) {
          zlibFlushDeflateBlock(p14121, true);
          if (p14121.strm.avail_out === 0) {
            return 3;
          } else {
            return 4;
          }
        } else if (p14121.sym_next && (zlibFlushDeflateBlock(p14121, false), p14121.strm.avail_out === 0)) {
          return 1;
        } else {
          return 2;
        }
      })(v7675, p14118) : ce[v7675.level].func(v7675, p14118);
      if (v7687 === 3 || v7687 === 4) {
        v7675.status = qt;
      }
      if (v7687 === 1 || v7687 === 3) {
        if (p14117.avail_out === 0) {
          v7675.last_flush = -1;
        }
        return Lt;
      }
      if (v7687 === 2 && (p14118 === Ct ? deflateTrAlign(v7675) : p14118 !== Rt && (deflateTrStoredBlock(v7675, 0, 0, false), p14118 === Mt && (Jt(v7675.head), v7675.lookahead === 0 && (v7675.strstart = 0, v7675.block_start = 0, v7675.insert = 0))), zlibCopyPendingToOutput(p14117), p14117.avail_out === 0)) {
        v7675.last_flush = -1;
        return Lt;
      }
    }
    if (p14118 !== Pt) {
      return Lt;
    } else if (v7675.wrap <= 0) {
      return Ot;
    } else {
      if (v7675.wrap === 2) {
        zlibPendingWriteByte(v7675, p14117.adler & 255);
        zlibPendingWriteByte(v7675, p14117.adler >> 8 & 255);
        zlibPendingWriteByte(v7675, p14117.adler >> 16 & 255);
        zlibPendingWriteByte(v7675, p14117.adler >> 24 & 255);
        zlibPendingWriteByte(v7675, p14117.total_in & 255);
        zlibPendingWriteByte(v7675, p14117.total_in >> 8 & 255);
        zlibPendingWriteByte(v7675, p14117.total_in >> 16 & 255);
        zlibPendingWriteByte(v7675, p14117.total_in >> 24 & 255);
      } else {
        zlibPendingWriteUint16BE(v7675, p14117.adler >>> 16);
        zlibPendingWriteUint16BE(v7675, p14117.adler & 65535);
      }
      zlibCopyPendingToOutput(p14117);
      if (v7675.wrap > 0) {
        v7675.wrap = -v7675.wrap;
      }
      if (v7675.pending !== 0) {
        return Lt;
      } else {
        return Ot;
      }
    }
  },
  deflateEnd: p14123 => {
    if (pe(p14123)) {
      return Ft;
    }
    const v7694 = p14123.state.status;
    p14123.state = null;
    if (v7694 === jt) {
      return zlibAttachStreamMsg(p14123, Dt);
    } else {
      return Lt;
    }
  },
  deflateSetDictionary: (p14124, p14125) => {
    let v7695 = p14125.length;
    if (pe(p14124)) {
      return Ft;
    }
    const v7696 = p14124.state;
    const v7697 = v7696.wrap;
    if (v7697 === 2 || v7697 === 1 && v7696.status !== Ht || v7696.lookahead) {
      return Ft;
    }
    if (v7697 === 1) {
      p14124.adler = zlibAdler32(p14124.adler, p14125, v7695, 0);
    }
    v7696.wrap = 0;
    if (v7695 >= v7696.w_size) {
      if (v7697 === 0) {
        Jt(v7696.head);
        v7696.strstart = 0;
        v7696.block_start = 0;
        v7696.insert = 0;
      }
      let v7698 = new Uint8Array(v7696.w_size);
      v7698.set(p14125.subarray(v7695 - v7696.w_size, v7695), 0);
      p14125 = v7698;
      v7695 = v7696.w_size;
    }
    const v7699 = p14124.avail_in;
    const v7700 = p14124.next_in;
    const v7701 = p14124.input;
    p14124.avail_in = v7695;
    p14124.next_in = 0;
    p14124.input = p14125;
    ae(v7696);
    while (v7696.lookahead >= 3) {
      let v7702 = v7696.strstart;
      let v7703 = v7696.lookahead - 2;
      do {
        v7696.ins_h = $t(v7696, v7696.ins_h, v7696.window[v7702 + 3 - 1]);
        v7696.prev[v7702 & v7696.w_mask] = v7696.head[v7696.ins_h];
        v7696.head[v7696.ins_h] = v7702;
        v7702++;
      } while (--v7703);
      v7696.strstart = v7702;
      v7696.lookahead = 2;
      ae(v7696);
    }
    v7696.strstart += v7696.lookahead;
    v7696.block_start = v7696.strstart;
    v7696.insert = v7696.lookahead;
    v7696.lookahead = 0;
    v7696.match_length = v7696.prev_length = 2;
    v7696.match_available = 0;
    p14124.next_in = v7700;
    p14124.input = v7701;
    p14124.avail_in = v7699;
    v7696.wrap = v7697;
    return Lt;
  },
  deflateInfo: "pako deflate (from Nodeca project)"
};
const ye = (p14126, p14127) => Object.prototype.hasOwnProperty.call(p14126, p14127);
function assignPartial(p14128) {
  const v7704 = Array.prototype.slice.call(arguments, 1);
  while (v7704.length) {
    const v7705 = v7704.shift();
    if (v7705) {
      if (typeof v7705 != "object") {
        throw new TypeError(v7705 + "must be non-object");
      }
      for (const v7706 in v7705) {
        if (ye(v7705, v7706)) {
          p14128[v7706] = v7705[v7706];
        }
      }
    }
  }
  return p14128;
}
var _e = p14129 => {
  let vLN0891 = 0;
  for (let vLN0892 = 0, v7707 = p14129.length; vLN0892 < v7707; vLN0892++) {
    vLN0891 += p14129[vLN0892].length;
  }
  const v7708 = new Uint8Array(vLN0891);
  for (let vLN0893 = 0, vLN0894 = 0, v7709 = p14129.length; vLN0893 < v7709; vLN0893++) {
    let v7710 = p14129[vLN0893];
    v7708.set(v7710, vLN0894);
    vLN0894 += v7710.length;
  }
  return v7708;
};
let we = true;
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch (e17) {
  we = false;
}
const Te = new Uint8Array(256);
for (let As = 0; As < 256; As++) {
  Te[As] = As >= 252 ? 6 : As >= 248 ? 5 : As >= 240 ? 4 : As >= 224 ? 3 : As >= 192 ? 2 : 1;
}
Te[254] = Te[254] = 1;
var be = p14130 => {
  if (typeof TextEncoder == "function" && TextEncoder.prototype.encode) {
    return new TextEncoder().encode(p14130);
  }
  let v7711;
  let v7712;
  let v7713;
  let v7714;
  let v7715;
  let v7716 = p14130.length;
  let vLN0895 = 0;
  for (v7714 = 0; v7714 < v7716; v7714++) {
    v7712 = p14130.charCodeAt(v7714);
    if ((v7712 & 64512) == 55296 && v7714 + 1 < v7716) {
      v7713 = p14130.charCodeAt(v7714 + 1);
      if ((v7713 & 64512) == 56320) {
        v7712 = 65536 + (v7712 - 55296 << 10) + (v7713 - 56320);
        v7714++;
      }
    }
    vLN0895 += v7712 < 128 ? 1 : v7712 < 2048 ? 2 : v7712 < 65536 ? 3 : 4;
  }
  v7711 = new Uint8Array(vLN0895);
  v7715 = 0;
  v7714 = 0;
  for (; v7715 < vLN0895; v7714++) {
    v7712 = p14130.charCodeAt(v7714);
    if ((v7712 & 64512) == 55296 && v7714 + 1 < v7716) {
      v7713 = p14130.charCodeAt(v7714 + 1);
      if ((v7713 & 64512) == 56320) {
        v7712 = 65536 + (v7712 - 55296 << 10) + (v7713 - 56320);
        v7714++;
      }
    }
    if (v7712 < 128) {
      v7711[v7715++] = v7712;
    } else if (v7712 < 2048) {
      v7711[v7715++] = v7712 >>> 6 | 192;
      v7711[v7715++] = v7712 & 63 | 128;
    } else if (v7712 < 65536) {
      v7711[v7715++] = v7712 >>> 12 | 224;
      v7711[v7715++] = v7712 >>> 6 & 63 | 128;
      v7711[v7715++] = v7712 & 63 | 128;
    } else {
      v7711[v7715++] = v7712 >>> 18 | 240;
      v7711[v7715++] = v7712 >>> 12 & 63 | 128;
      v7711[v7715++] = v7712 >>> 6 & 63 | 128;
      v7711[v7715++] = v7712 & 63 | 128;
    }
  }
  return v7711;
};
var Se = (p14131, p14132) => {
  const v7717 = p14132 || p14131.length;
  if (typeof TextDecoder == "function" && TextDecoder.prototype.decode) {
    return new TextDecoder().decode(p14131.subarray(0, p14132));
  }
  let v7718;
  let v7719;
  const v7720 = new Array(v7717 * 2);
  v7719 = 0;
  v7718 = 0;
  while (v7718 < v7717) {
    let v7721 = p14131[v7718++];
    if (v7721 < 128) {
      v7720[v7719++] = v7721;
      continue;
    }
    let v7722 = Te[v7721];
    if (v7722 > 4) {
      v7720[v7719++] = 65533;
      v7718 += v7722 - 1;
    } else {
      for (v7721 &= v7722 === 2 ? 31 : v7722 === 3 ? 15 : 7; v7722 > 1 && v7718 < v7717;) {
        v7721 = v7721 << 6 | p14131[v7718++] & 63;
        v7722--;
      }
      if (v7722 > 1) {
        v7720[v7719++] = 65533;
      } else if (v7721 < 65536) {
        v7720[v7719++] = v7721;
      } else {
        v7721 -= 65536;
        v7720[v7719++] = v7721 >> 10 & 1023 | 55296;
        v7720[v7719++] = v7721 & 1023 | 56320;
      }
    }
  }
  return ((p14133, p14134) => {
    if (p14134 < 65534 && p14133.subarray && we) {
      return String.fromCharCode.apply(null, p14133.length === p14134 ? p14133 : p14133.subarray(0, p14134));
    }
    let vLS29 = "";
    for (let vLN0896 = 0; vLN0896 < p14134; vLN0896++) {
      vLS29 += String.fromCharCode(p14133[vLN0896]);
    }
    return vLS29;
  })(v7720, v7719);
};
var Ee = (p14135, p14136) => {
  if ((p14136 = p14136 || p14135.length) > p14135.length) {
    p14136 = p14135.length;
  }
  let v7723 = p14136 - 1;
  while (v7723 >= 0 && (p14135[v7723] & 192) == 128) {
    v7723--;
  }
  if (v7723 < 0 || v7723 === 0) {
    return p14136;
  } else if (v7723 + Te[p14135[v7723]] > p14136) {
    return v7723;
  } else {
    return p14136;
  }
};
function ZlibStreamState() {
  this.input = null;
  this.next_in = 0;
  this.avail_in = 0;
  this.total_in = 0;
  this.output = null;
  this.next_out = 0;
  this.avail_out = 0;
  this.total_out = 0;
  this.msg = "";
  this.state = null;
  this.data_type = 2;
  this.adler = 0;
}
const objectPrototypeToString = Object.prototype.toString;
const {
  Z_NO_FLUSH: Me,
  Z_SYNC_FLUSH: Pe,
  Z_FULL_FLUSH: Re,
  Z_FINISH: Le,
  Z_OK: Oe,
  Z_STREAM_END: Fe,
  Z_DEFAULT_COMPRESSION: De,
  Z_DEFAULT_STRATEGY: ke,
  Z_DEFLATED: Ie
} = zlibConstants;
function ZlibDeflateStream(p14137) {
  this.options = assignPartial({
    level: De,
    method: Ie,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: ke
  }, p14137 || {});
  let v7724 = this.options;
  if (v7724.raw && v7724.windowBits > 0) {
    v7724.windowBits = -v7724.windowBits;
  } else if (v7724.gzip && v7724.windowBits > 0 && v7724.windowBits < 16) {
    v7724.windowBits += 16;
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new ZlibStreamState();
  this.strm.avail_out = 0;
  let v7725 = deflateAPI.deflateInit2(this.strm, v7724.level, v7724.method, v7724.windowBits, v7724.memLevel, v7724.strategy);
  if (v7725 !== Oe) {
    throw new Error(zlibErrMsgs[v7725]);
  }
  if (v7724.header) {
    deflateAPI.deflateSetHeader(this.strm, v7724.header);
  }
  if (v7724.dictionary) {
    let v7726;
    v7726 = typeof v7724.dictionary == "string" ? be(v7724.dictionary) : objectPrototypeToString.call(v7724.dictionary) === "[object ArrayBuffer]" ? new Uint8Array(v7724.dictionary) : v7724.dictionary;
    v7725 = deflateAPI.deflateSetDictionary(this.strm, v7726);
    if (v7725 !== Oe) {
      throw new Error(zlibErrMsgs[v7725]);
    }
    this._dict_set = true;
  }
}
function Ne(p14138, p14139) {
  const v7727 = new ZlibDeflateStream(p14139);
  v7727.push(p14138, true);
  if (v7727.err) {
    throw v7727.msg || zlibErrMsgs[v7727.err];
  }
  return v7727.result;
}
ZlibDeflateStream.prototype.push = function (p14140, p14141) {
  const v7728 = this.strm;
  const v7729 = this.options.chunkSize;
  let v7730;
  let v7731;
  if (this.ended) {
    return false;
  }
  v7731 = p14141 === ~~p14141 ? p14141 : p14141 === true ? Le : Me;
  if (typeof p14140 == "string") {
    v7728.input = be(p14140);
  } else if (objectPrototypeToString.call(p14140) === "[object ArrayBuffer]") {
    v7728.input = new Uint8Array(p14140);
  } else {
    v7728.input = p14140;
  }
  v7728.next_in = 0;
  v7728.avail_in = v7728.input.length;
  while (true) {
    if (v7728.avail_out === 0) {
      v7728.output = new Uint8Array(v7729);
      v7728.next_out = 0;
      v7728.avail_out = v7729;
    }
    if ((v7731 === Pe || v7731 === Re) && v7728.avail_out <= 6) {
      this.onData(v7728.output.subarray(0, v7728.next_out));
      v7728.avail_out = 0;
    } else {
      v7730 = deflateAPI.deflate(v7728, v7731);
      if (v7730 === Fe) {
        if (v7728.next_out > 0) {
          this.onData(v7728.output.subarray(0, v7728.next_out));
        }
        v7730 = deflateAPI.deflateEnd(this.strm);
        this.onEnd(v7730);
        this.ended = true;
        return v7730 === Oe;
      }
      if (v7728.avail_out !== 0) {
        if (v7731 > 0 && v7728.next_out > 0) {
          this.onData(v7728.output.subarray(0, v7728.next_out));
          v7728.avail_out = 0;
        } else if (v7728.avail_in === 0) {
          break;
        }
      } else {
        this.onData(v7728.output);
      }
    }
  }
  return true;
};
ZlibDeflateStream.prototype.onData = function (p14142) {
  this.chunks.push(p14142);
};
ZlibDeflateStream.prototype.onEnd = function (p14143) {
  if (p14143 === Oe) {
    this.result = _e(this.chunks);
  }
  this.chunks = [];
  this.err = p14143;
  this.msg = this.strm.msg;
};
var zlibDeflateEngine = {
  Deflate: ZlibDeflateStream,
  deflate: Ne,
  deflateRaw: function (p14144, p14145) {
    (p14145 = p14145 || {}).raw = true;
    return Ne(p14144, p14145);
  },
  gzip: function (p14146, p14147) {
    (p14147 = p14147 || {}).gzip = true;
    return Ne(p14146, p14147);
  }
};
const DEFLATE_STATE_16209 = 16209;
function Ue(p14148, p14149) {
  let v7732;
  let v7733;
  let v7734;
  let v7735;
  let v7736;
  let v7737;
  let v7738;
  let v7739;
  let v7740;
  let v7741;
  let v7742;
  let v7743;
  let v7744;
  let v7745;
  let v7746;
  let v7747;
  let v7748;
  let v7749;
  let v7750;
  let v7751;
  let v7752;
  let v7753;
  let v7754;
  let v7755;
  const v7756 = p14148.state;
  v7732 = p14148.next_in;
  v7754 = p14148.input;
  v7733 = v7732 + (p14148.avail_in - 5);
  v7734 = p14148.next_out;
  v7755 = p14148.output;
  v7735 = v7734 - (p14149 - p14148.avail_out);
  v7736 = v7734 + (p14148.avail_out - 257);
  v7737 = v7756.dmax;
  v7738 = v7756.wsize;
  v7739 = v7756.whave;
  v7740 = v7756.wnext;
  v7741 = v7756.window;
  v7742 = v7756.hold;
  v7743 = v7756.bits;
  v7744 = v7756.lencode;
  v7745 = v7756.distcode;
  v7746 = (1 << v7756.lenbits) - 1;
  v7747 = (1 << v7756.distbits) - 1;
  _0x3e9370: do {
    if (v7743 < 15) {
      v7742 += v7754[v7732++] << v7743;
      v7743 += 8;
      v7742 += v7754[v7732++] << v7743;
      v7743 += 8;
    }
    v7748 = v7744[v7742 & v7746];
    _0x68b98: while (true) {
      v7749 = v7748 >>> 24;
      v7742 >>>= v7749;
      v7743 -= v7749;
      v7749 = v7748 >>> 16 & 255;
      if (v7749 === 0) {
        v7755[v7734++] = v7748 & 65535;
      } else {
        if (!(v7749 & 16)) {
          if (v7749 & 64) {
            if (v7749 & 32) {
              v7756.mode = 16191;
              break _0x3e9370;
            }
            p14148.msg = "invalid literal/length code";
            v7756.mode = DEFLATE_STATE_16209;
            break _0x3e9370;
          }
          v7748 = v7744[(v7748 & 65535) + (v7742 & (1 << v7749) - 1)];
          continue _0x68b98;
        }
        v7750 = v7748 & 65535;
        v7749 &= 15;
        if (v7749) {
          if (v7743 < v7749) {
            v7742 += v7754[v7732++] << v7743;
            v7743 += 8;
          }
          v7750 += v7742 & (1 << v7749) - 1;
          v7742 >>>= v7749;
          v7743 -= v7749;
        }
        if (v7743 < 15) {
          v7742 += v7754[v7732++] << v7743;
          v7743 += 8;
          v7742 += v7754[v7732++] << v7743;
          v7743 += 8;
        }
        v7748 = v7745[v7742 & v7747];
        while (true) {
          v7749 = v7748 >>> 24;
          v7742 >>>= v7749;
          v7743 -= v7749;
          v7749 = v7748 >>> 16 & 255;
          if (v7749 & 16) {
            v7751 = v7748 & 65535;
            v7749 &= 15;
            if (v7743 < v7749) {
              v7742 += v7754[v7732++] << v7743;
              v7743 += 8;
              if (v7743 < v7749) {
                v7742 += v7754[v7732++] << v7743;
                v7743 += 8;
              }
            }
            v7751 += v7742 & (1 << v7749) - 1;
            if (v7751 > v7737) {
              p14148.msg = "invalid distance too far back";
              v7756.mode = DEFLATE_STATE_16209;
              break _0x3e9370;
            }
            v7742 >>>= v7749;
            v7743 -= v7749;
            v7749 = v7734 - v7735;
            if (v7751 > v7749) {
              v7749 = v7751 - v7749;
              if (v7749 > v7739 && v7756.sane) {
                p14148.msg = "invalid distance too far back";
                v7756.mode = DEFLATE_STATE_16209;
                break _0x3e9370;
              }
              v7752 = 0;
              v7753 = v7741;
              if (v7740 === 0) {
                v7752 += v7738 - v7749;
                if (v7749 < v7750) {
                  v7750 -= v7749;
                  do {
                    v7755[v7734++] = v7741[v7752++];
                  } while (--v7749);
                  v7752 = v7734 - v7751;
                  v7753 = v7755;
                }
              } else if (v7740 < v7749) {
                v7752 += v7738 + v7740 - v7749;
                v7749 -= v7740;
                if (v7749 < v7750) {
                  v7750 -= v7749;
                  do {
                    v7755[v7734++] = v7741[v7752++];
                  } while (--v7749);
                  v7752 = 0;
                  if (v7740 < v7750) {
                    v7749 = v7740;
                    v7750 -= v7749;
                    do {
                      v7755[v7734++] = v7741[v7752++];
                    } while (--v7749);
                    v7752 = v7734 - v7751;
                    v7753 = v7755;
                  }
                }
              } else {
                v7752 += v7740 - v7749;
                if (v7749 < v7750) {
                  v7750 -= v7749;
                  do {
                    v7755[v7734++] = v7741[v7752++];
                  } while (--v7749);
                  v7752 = v7734 - v7751;
                  v7753 = v7755;
                }
              }
              while (v7750 > 2) {
                v7755[v7734++] = v7753[v7752++];
                v7755[v7734++] = v7753[v7752++];
                v7755[v7734++] = v7753[v7752++];
                v7750 -= 3;
              }
              if (v7750) {
                v7755[v7734++] = v7753[v7752++];
                if (v7750 > 1) {
                  v7755[v7734++] = v7753[v7752++];
                }
              }
            } else {
              v7752 = v7734 - v7751;
              do {
                v7755[v7734++] = v7755[v7752++];
                v7755[v7734++] = v7755[v7752++];
                v7755[v7734++] = v7755[v7752++];
                v7750 -= 3;
              } while (v7750 > 2);
              if (v7750) {
                v7755[v7734++] = v7755[v7752++];
                if (v7750 > 1) {
                  v7755[v7734++] = v7755[v7752++];
                }
              }
            }
            break;
          }
          if (v7749 & 64) {
            p14148.msg = "invalid distance code";
            v7756.mode = DEFLATE_STATE_16209;
            break _0x3e9370;
          }
          v7748 = v7745[(v7748 & 65535) + (v7742 & (1 << v7749) - 1)];
        }
      }
      break;
    }
  } while (v7732 < v7733 && v7734 < v7736);
  v7750 = v7743 >> 3;
  v7732 -= v7750;
  v7743 -= v7750 << 3;
  v7742 &= (1 << v7743) - 1;
  p14148.next_in = v7732;
  p14148.next_out = v7734;
  p14148.avail_in = v7732 < v7733 ? v7733 - v7732 + 5 : 5 - (v7732 - v7733);
  p14148.avail_out = v7734 < v7736 ? v7736 - v7734 + 257 : 257 - (v7734 - v7736);
  v7756.hold = v7742;
  v7756.bits = v7743;
}
const ze = 15;
const Ge = new Uint16Array([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0]);
const We = new Uint8Array([16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78]);
const Ve = new Uint16Array([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0]);
const He = new Uint8Array([16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64]);
var je = (p14150, p14151, p14152, p14153, p14154, p14155, p14156, p14157) => {
  const v7757 = p14157.bits;
  let v7758;
  let v7759;
  let v7760;
  let v7761;
  let v7762;
  let v7763;
  let vLN0897 = 0;
  let vLN0898 = 0;
  let vLN0899 = 0;
  let vLN0900 = 0;
  let vLN0901 = 0;
  let vLN0902 = 0;
  let vLN0903 = 0;
  let vLN0904 = 0;
  let vLN0905 = 0;
  let vLN0906 = 0;
  let v7764 = null;
  const v7765 = new Uint16Array(16);
  const v7766 = new Uint16Array(16);
  let v7767;
  let v7768;
  let v7769;
  let v7770 = null;
  for (vLN0897 = 0; vLN0897 <= ze; vLN0897++) {
    v7765[vLN0897] = 0;
  }
  for (vLN0898 = 0; vLN0898 < p14153; vLN0898++) {
    v7765[p14151[p14152 + vLN0898]]++;
  }
  vLN0901 = v7757;
  vLN0900 = ze;
  for (; vLN0900 >= 1 && v7765[vLN0900] === 0; vLN0900--);
  if (vLN0901 > vLN0900) {
    vLN0901 = vLN0900;
  }
  if (vLN0900 === 0) {
    p14154[p14155++] = 20971520;
    p14154[p14155++] = 20971520;
    p14157.bits = 1;
    return 0;
  }
  for (vLN0899 = 1; vLN0899 < vLN0900 && v7765[vLN0899] === 0; vLN0899++);
  if (vLN0901 < vLN0899) {
    vLN0901 = vLN0899;
  }
  vLN0904 = 1;
  vLN0897 = 1;
  for (; vLN0897 <= ze; vLN0897++) {
    vLN0904 <<= 1;
    vLN0904 -= v7765[vLN0897];
    if (vLN0904 < 0) {
      return -1;
    }
  }
  if (vLN0904 > 0 && (p14150 === 0 || vLN0900 !== 1)) {
    return -1;
  }
  v7766[1] = 0;
  vLN0897 = 1;
  for (; vLN0897 < ze; vLN0897++) {
    v7766[vLN0897 + 1] = v7766[vLN0897] + v7765[vLN0897];
  }
  for (vLN0898 = 0; vLN0898 < p14153; vLN0898++) {
    if (p14151[p14152 + vLN0898] !== 0) {
      p14156[v7766[p14151[p14152 + vLN0898]]++] = vLN0898;
    }
  }
  if (p14150 === 0) {
    v7764 = v7770 = p14156;
    v7763 = 20;
  } else if (p14150 === 1) {
    v7764 = Ge;
    v7770 = We;
    v7763 = 257;
  } else {
    v7764 = Ve;
    v7770 = He;
    v7763 = 0;
  }
  vLN0906 = 0;
  vLN0898 = 0;
  vLN0897 = vLN0899;
  v7762 = p14155;
  vLN0902 = vLN0901;
  vLN0903 = 0;
  v7760 = -1;
  vLN0905 = 1 << vLN0901;
  v7761 = vLN0905 - 1;
  if (p14150 === 1 && vLN0905 > 852 || p14150 === 2 && vLN0905 > 592) {
    return 1;
  }
  while (true) {
    v7767 = vLN0897 - vLN0903;
    if (p14156[vLN0898] + 1 < v7763) {
      v7768 = 0;
      v7769 = p14156[vLN0898];
    } else if (p14156[vLN0898] >= v7763) {
      v7768 = v7770[p14156[vLN0898] - v7763];
      v7769 = v7764[p14156[vLN0898] - v7763];
    } else {
      v7768 = 96;
      v7769 = 0;
    }
    v7758 = 1 << vLN0897 - vLN0903;
    v7759 = 1 << vLN0902;
    vLN0899 = v7759;
    do {
      v7759 -= v7758;
      p14154[v7762 + (vLN0906 >> vLN0903) + v7759] = v7767 << 24 | v7768 << 16 | v7769;
    } while (v7759 !== 0);
    for (v7758 = 1 << vLN0897 - 1; vLN0906 & v7758;) {
      v7758 >>= 1;
    }
    if (v7758 !== 0) {
      vLN0906 &= v7758 - 1;
      vLN0906 += v7758;
    } else {
      vLN0906 = 0;
    }
    vLN0898++;
    if (--v7765[vLN0897] === 0) {
      if (vLN0897 === vLN0900) {
        break;
      }
      vLN0897 = p14151[p14152 + p14156[vLN0898]];
    }
    if (vLN0897 > vLN0901 && (vLN0906 & v7761) !== v7760) {
      if (vLN0903 === 0) {
        vLN0903 = vLN0901;
      }
      v7762 += vLN0899;
      vLN0902 = vLN0897 - vLN0903;
      vLN0904 = 1 << vLN0902;
      while (vLN0902 + vLN0903 < vLN0900 && (vLN0904 -= v7765[vLN0902 + vLN0903], !(vLN0904 <= 0))) {
        vLN0902++;
        vLN0904 <<= 1;
      }
      vLN0905 += 1 << vLN0902;
      if (p14150 === 1 && vLN0905 > 852 || p14150 === 2 && vLN0905 > 592) {
        return 1;
      }
      v7760 = vLN0906 & v7761;
      p14154[v7760] = vLN0901 << 24 | vLN0902 << 16 | v7762 - p14155;
    }
  }
  if (vLN0906 !== 0) {
    p14154[v7762 + vLN0906] = vLN0897 - vLN0903 << 24 | 4194304;
  }
  p14157.bits = vLN0901;
  return 0;
};
const {
  Z_FINISH: qe,
  Z_BLOCK: Ke,
  Z_TREES: Ze,
  Z_OK: Je,
  Z_STREAM_END: Qe,
  Z_NEED_DICT: $e,
  Z_STREAM_ERROR: ti,
  Z_DATA_ERROR: ei,
  Z_MEM_ERROR: ii,
  Z_BUF_ERROR: si,
  Z_DEFLATED: ri
} = zlibConstants;
const ni = 16180;
const ai = 16190;
const oi = 16191;
const hi = 16192;
const li = 16194;
const ui = 16199;
const ci = 16200;
const di = 16206;
const pi = 16209;
const fi = p14158 => (p14158 >>> 24 & 255) + (p14158 >>> 8 & 65280) + ((p14158 & 65280) << 8) + ((p14158 & 255) << 24);
function gi() {
  this.strm = null;
  this.mode = 0;
  this.last = false;
  this.wrap = 0;
  this.havedict = false;
  this.flags = 0;
  this.dmax = 0;
  this.check = 0;
  this.total = 0;
  this.head = null;
  this.wbits = 0;
  this.wsize = 0;
  this.whave = 0;
  this.wnext = 0;
  this.window = null;
  this.hold = 0;
  this.bits = 0;
  this.length = 0;
  this.offset = 0;
  this.extra = 0;
  this.lencode = null;
  this.distcode = null;
  this.lenbits = 0;
  this.distbits = 0;
  this.ncode = 0;
  this.nlen = 0;
  this.ndist = 0;
  this.have = 0;
  this.next = null;
  this.lens = new Uint16Array(320);
  this.work = new Uint16Array(288);
  this.lendyn = null;
  this.distdyn = null;
  this.sane = 0;
  this.back = 0;
  this.was = 0;
}
const vi = p14159 => {
  if (!p14159) {
    return 1;
  }
  const v7771 = p14159.state;
  if (!v7771 || v7771.strm !== p14159 || v7771.mode < ni || v7771.mode > 16211) {
    return 1;
  } else {
    return 0;
  }
};
const mi = p14160 => {
  if (vi(p14160)) {
    return ti;
  }
  const v7772 = p14160.state;
  p14160.total_in = p14160.total_out = v7772.total = 0;
  p14160.msg = "";
  if (v7772.wrap) {
    p14160.adler = v7772.wrap & 1;
  }
  v7772.mode = ni;
  v7772.last = 0;
  v7772.havedict = 0;
  v7772.flags = -1;
  v7772.dmax = 32768;
  v7772.head = null;
  v7772.hold = 0;
  v7772.bits = 0;
  v7772.lencode = v7772.lendyn = new Int32Array(852);
  v7772.distcode = v7772.distdyn = new Int32Array(592);
  v7772.sane = 1;
  v7772.back = -1;
  return Je;
};
const yi = p14161 => {
  if (vi(p14161)) {
    return ti;
  }
  const v7773 = p14161.state;
  v7773.wsize = 0;
  v7773.whave = 0;
  v7773.wnext = 0;
  return mi(p14161);
};
const xi = (p14162, p14163) => {
  let v7774;
  if (vi(p14162)) {
    return ti;
  }
  const v7775 = p14162.state;
  if (p14163 < 0) {
    v7774 = 0;
    p14163 = -p14163;
  } else {
    v7774 = 5 + (p14163 >> 4);
    if (p14163 < 48) {
      p14163 &= 15;
    }
  }
  if (p14163 && (p14163 < 8 || p14163 > 15)) {
    return ti;
  } else {
    if (v7775.window !== null && v7775.wbits !== p14163) {
      v7775.window = null;
    }
    v7775.wrap = v7774;
    v7775.wbits = p14163;
    return yi(p14162);
  }
};
const _i = (p14164, p14165) => {
  if (!p14164) {
    return ti;
  }
  const v7776 = new gi();
  p14164.state = v7776;
  v7776.strm = p14164;
  v7776.window = null;
  v7776.mode = ni;
  const vXi = xi(p14164, p14165);
  if (vXi !== Je) {
    p14164.state = null;
  }
  return vXi;
};
let wi;
let Ti;
let bi = true;
const Si = p14166 => {
  if (bi) {
    wi = new Int32Array(512);
    Ti = new Int32Array(32);
    let vLN0907 = 0;
    while (vLN0907 < 144) {
      p14166.lens[vLN0907++] = 8;
    }
    while (vLN0907 < 256) {
      p14166.lens[vLN0907++] = 9;
    }
    while (vLN0907 < 280) {
      p14166.lens[vLN0907++] = 7;
    }
    while (vLN0907 < 288) {
      p14166.lens[vLN0907++] = 8;
    }
    je(1, p14166.lens, 0, 288, wi, 0, p14166.work, {
      bits: 9
    });
    vLN0907 = 0;
    while (vLN0907 < 32) {
      p14166.lens[vLN0907++] = 5;
    }
    je(2, p14166.lens, 0, 32, Ti, 0, p14166.work, {
      bits: 5
    });
    bi = false;
  }
  p14166.lencode = wi;
  p14166.lenbits = 9;
  p14166.distcode = Ti;
  p14166.distbits = 5;
};
const Ei = (p14167, p14168, p14169, p14170) => {
  let v7777;
  const v7778 = p14167.state;
  if (v7778.window === null) {
    v7778.wsize = 1 << v7778.wbits;
    v7778.wnext = 0;
    v7778.whave = 0;
    v7778.window = new Uint8Array(v7778.wsize);
  }
  if (p14170 >= v7778.wsize) {
    v7778.window.set(p14168.subarray(p14169 - v7778.wsize, p14169), 0);
    v7778.wnext = 0;
    v7778.whave = v7778.wsize;
  } else {
    v7777 = v7778.wsize - v7778.wnext;
    if (v7777 > p14170) {
      v7777 = p14170;
    }
    v7778.window.set(p14168.subarray(p14169 - p14170, p14169 - p14170 + v7777), v7778.wnext);
    if (p14170 -= v7777) {
      v7778.window.set(p14168.subarray(p14169 - p14170, p14169), 0);
      v7778.wnext = p14170;
      v7778.whave = v7778.wsize;
    } else {
      v7778.wnext += v7777;
      if (v7778.wnext === v7778.wsize) {
        v7778.wnext = 0;
      }
      if (v7778.whave < v7778.wsize) {
        v7778.whave += v7777;
      }
    }
  }
  return 0;
};
var inflateAPI = {
  inflateReset: yi,
  inflateReset2: xi,
  inflateResetKeep: mi,
  inflateInit: p14171 => _i(p14171, 15),
  inflateInit2: _i,
  inflate: (p14172, p14173) => {
    let v7779;
    let v7780;
    let v7781;
    let v7782;
    let v7783;
    let v7784;
    let v7785;
    let v7786;
    let v7787;
    let v7788;
    let v7789;
    let v7790;
    let v7791;
    let v7792;
    let v7793;
    let v7794;
    let v7795;
    let v7796;
    let v7797;
    let v7798;
    let v7799;
    let v7800;
    let vLN0908 = 0;
    const v7801 = new Uint8Array(4);
    let v7802;
    let v7803;
    const v7804 = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
    if (vi(p14172) || !p14172.output || !p14172.input && p14172.avail_in !== 0) {
      return ti;
    }
    v7779 = p14172.state;
    if (v7779.mode === oi) {
      v7779.mode = hi;
    }
    v7783 = p14172.next_out;
    v7781 = p14172.output;
    v7785 = p14172.avail_out;
    v7782 = p14172.next_in;
    v7780 = p14172.input;
    v7784 = p14172.avail_in;
    v7786 = v7779.hold;
    v7787 = v7779.bits;
    v7788 = v7784;
    v7789 = v7785;
    v7800 = Je;
    _0x1f988c: while (true) {
      switch (v7779.mode) {
        case ni:
          if (v7779.wrap === 0) {
            v7779.mode = hi;
            break;
          }
          while (v7787 < 16) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          if (v7779.wrap & 2 && v7786 === 35615) {
            if (v7779.wbits === 0) {
              v7779.wbits = 15;
            }
            v7779.check = 0;
            v7801[0] = v7786 & 255;
            v7801[1] = v7786 >>> 8 & 255;
            v7779.check = zlibCrc32(v7779.check, v7801, 2, 0);
            v7786 = 0;
            v7787 = 0;
            v7779.mode = 16181;
            break;
          }
          if (v7779.head) {
            v7779.head.done = false;
          }
          if (!(v7779.wrap & 1) || (((v7786 & 255) << 8) + (v7786 >> 8)) % 31) {
            p14172.msg = "incorrect header check";
            v7779.mode = pi;
            break;
          }
          if ((v7786 & 15) !== ri) {
            p14172.msg = "unknown compression method";
            v7779.mode = pi;
            break;
          }
          v7786 >>>= 4;
          v7787 -= 4;
          v7799 = 8 + (v7786 & 15);
          if (v7779.wbits === 0) {
            v7779.wbits = v7799;
          }
          if (v7799 > 15 || v7799 > v7779.wbits) {
            p14172.msg = "invalid window size";
            v7779.mode = pi;
            break;
          }
          v7779.dmax = 1 << v7779.wbits;
          v7779.flags = 0;
          p14172.adler = v7779.check = 1;
          v7779.mode = v7786 & 512 ? 16189 : oi;
          v7786 = 0;
          v7787 = 0;
          break;
        case 16181:
          while (v7787 < 16) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          v7779.flags = v7786;
          if ((v7779.flags & 255) !== ri) {
            p14172.msg = "unknown compression method";
            v7779.mode = pi;
            break;
          }
          if (v7779.flags & 57344) {
            p14172.msg = "unknown header flags set";
            v7779.mode = pi;
            break;
          }
          if (v7779.head) {
            v7779.head.text = v7786 >> 8 & 1;
          }
          if (v7779.flags & 512 && v7779.wrap & 4) {
            v7801[0] = v7786 & 255;
            v7801[1] = v7786 >>> 8 & 255;
            v7779.check = zlibCrc32(v7779.check, v7801, 2, 0);
          }
          v7786 = 0;
          v7787 = 0;
          v7779.mode = 16182;
        case 16182:
          while (v7787 < 32) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          if (v7779.head) {
            v7779.head.time = v7786;
          }
          if (v7779.flags & 512 && v7779.wrap & 4) {
            v7801[0] = v7786 & 255;
            v7801[1] = v7786 >>> 8 & 255;
            v7801[2] = v7786 >>> 16 & 255;
            v7801[3] = v7786 >>> 24 & 255;
            v7779.check = zlibCrc32(v7779.check, v7801, 4, 0);
          }
          v7786 = 0;
          v7787 = 0;
          v7779.mode = 16183;
        case 16183:
          while (v7787 < 16) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          if (v7779.head) {
            v7779.head.xflags = v7786 & 255;
            v7779.head.os = v7786 >> 8;
          }
          if (v7779.flags & 512 && v7779.wrap & 4) {
            v7801[0] = v7786 & 255;
            v7801[1] = v7786 >>> 8 & 255;
            v7779.check = zlibCrc32(v7779.check, v7801, 2, 0);
          }
          v7786 = 0;
          v7787 = 0;
          v7779.mode = 16184;
        case 16184:
          if (v7779.flags & 1024) {
            while (v7787 < 16) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            v7779.length = v7786;
            if (v7779.head) {
              v7779.head.extra_len = v7786;
            }
            if (v7779.flags & 512 && v7779.wrap & 4) {
              v7801[0] = v7786 & 255;
              v7801[1] = v7786 >>> 8 & 255;
              v7779.check = zlibCrc32(v7779.check, v7801, 2, 0);
            }
            v7786 = 0;
            v7787 = 0;
          } else if (v7779.head) {
            v7779.head.extra = null;
          }
          v7779.mode = 16185;
        case 16185:
          if (v7779.flags & 1024 && (v7790 = v7779.length, v7790 > v7784 && (v7790 = v7784), v7790 && (v7779.head && (v7799 = v7779.head.extra_len - v7779.length, v7779.head.extra ||= new Uint8Array(v7779.head.extra_len), v7779.head.extra.set(v7780.subarray(v7782, v7782 + v7790), v7799)), v7779.flags & 512 && v7779.wrap & 4 && (v7779.check = zlibCrc32(v7779.check, v7780, v7790, v7782)), v7784 -= v7790, v7782 += v7790, v7779.length -= v7790), v7779.length)) {
            break _0x1f988c;
          }
          v7779.length = 0;
          v7779.mode = 16186;
        case 16186:
          if (v7779.flags & 2048) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7790 = 0;
            do {
              v7799 = v7780[v7782 + v7790++];
              if (v7779.head && v7799 && v7779.length < 65536) {
                v7779.head.name += String.fromCharCode(v7799);
              }
            } while (v7799 && v7790 < v7784);
            if (v7779.flags & 512 && v7779.wrap & 4) {
              v7779.check = zlibCrc32(v7779.check, v7780, v7790, v7782);
            }
            v7784 -= v7790;
            v7782 += v7790;
            if (v7799) {
              break _0x1f988c;
            }
          } else if (v7779.head) {
            v7779.head.name = null;
          }
          v7779.length = 0;
          v7779.mode = 16187;
        case 16187:
          if (v7779.flags & 4096) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7790 = 0;
            do {
              v7799 = v7780[v7782 + v7790++];
              if (v7779.head && v7799 && v7779.length < 65536) {
                v7779.head.comment += String.fromCharCode(v7799);
              }
            } while (v7799 && v7790 < v7784);
            if (v7779.flags & 512 && v7779.wrap & 4) {
              v7779.check = zlibCrc32(v7779.check, v7780, v7790, v7782);
            }
            v7784 -= v7790;
            v7782 += v7790;
            if (v7799) {
              break _0x1f988c;
            }
          } else if (v7779.head) {
            v7779.head.comment = null;
          }
          v7779.mode = 16188;
        case 16188:
          if (v7779.flags & 512) {
            while (v7787 < 16) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            if (v7779.wrap & 4 && v7786 !== (v7779.check & 65535)) {
              p14172.msg = "header crc mismatch";
              v7779.mode = pi;
              break;
            }
            v7786 = 0;
            v7787 = 0;
          }
          if (v7779.head) {
            v7779.head.hcrc = v7779.flags >> 9 & 1;
            v7779.head.done = true;
          }
          p14172.adler = v7779.check = 0;
          v7779.mode = oi;
          break;
        case 16189:
          while (v7787 < 32) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          p14172.adler = v7779.check = fi(v7786);
          v7786 = 0;
          v7787 = 0;
          v7779.mode = ai;
        case ai:
          if (v7779.havedict === 0) {
            p14172.next_out = v7783;
            p14172.avail_out = v7785;
            p14172.next_in = v7782;
            p14172.avail_in = v7784;
            v7779.hold = v7786;
            v7779.bits = v7787;
            return $e;
          }
          p14172.adler = v7779.check = 1;
          v7779.mode = oi;
        case oi:
          if (p14173 === Ke || p14173 === Ze) {
            break _0x1f988c;
          }
        case hi:
          if (v7779.last) {
            v7786 >>>= v7787 & 7;
            v7787 -= v7787 & 7;
            v7779.mode = di;
            break;
          }
          while (v7787 < 3) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          v7779.last = v7786 & 1;
          v7786 >>>= 1;
          v7787 -= 1;
          switch (v7786 & 3) {
            case 0:
              v7779.mode = 16193;
              break;
            case 1:
              Si(v7779);
              v7779.mode = ui;
              if (p14173 === Ze) {
                v7786 >>>= 2;
                v7787 -= 2;
                break _0x1f988c;
              }
              break;
            case 2:
              v7779.mode = 16196;
              break;
            case 3:
              p14172.msg = "invalid block type";
              v7779.mode = pi;
          }
          v7786 >>>= 2;
          v7787 -= 2;
          break;
        case 16193:
          v7786 >>>= v7787 & 7;
          v7787 -= v7787 & 7;
          while (v7787 < 32) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          if ((v7786 & 65535) != (v7786 >>> 16 ^ 65535)) {
            p14172.msg = "invalid stored block lengths";
            v7779.mode = pi;
            break;
          }
          v7779.length = v7786 & 65535;
          v7786 = 0;
          v7787 = 0;
          v7779.mode = li;
          if (p14173 === Ze) {
            break _0x1f988c;
          }
        case li:
          v7779.mode = 16195;
        case 16195:
          v7790 = v7779.length;
          if (v7790) {
            if (v7790 > v7784) {
              v7790 = v7784;
            }
            if (v7790 > v7785) {
              v7790 = v7785;
            }
            if (v7790 === 0) {
              break _0x1f988c;
            }
            v7781.set(v7780.subarray(v7782, v7782 + v7790), v7783);
            v7784 -= v7790;
            v7782 += v7790;
            v7785 -= v7790;
            v7783 += v7790;
            v7779.length -= v7790;
            break;
          }
          v7779.mode = oi;
          break;
        case 16196:
          while (v7787 < 14) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          v7779.nlen = 257 + (v7786 & 31);
          v7786 >>>= 5;
          v7787 -= 5;
          v7779.ndist = 1 + (v7786 & 31);
          v7786 >>>= 5;
          v7787 -= 5;
          v7779.ncode = 4 + (v7786 & 15);
          v7786 >>>= 4;
          v7787 -= 4;
          if (v7779.nlen > 286 || v7779.ndist > 30) {
            p14172.msg = "too many length or distance symbols";
            v7779.mode = pi;
            break;
          }
          v7779.have = 0;
          v7779.mode = 16197;
        case 16197:
          while (v7779.have < v7779.ncode) {
            while (v7787 < 3) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            v7779.lens[v7804[v7779.have++]] = v7786 & 7;
            v7786 >>>= 3;
            v7787 -= 3;
          }
          while (v7779.have < 19) {
            v7779.lens[v7804[v7779.have++]] = 0;
          }
          v7779.lencode = v7779.lendyn;
          v7779.lenbits = 7;
          v7802 = {
            bits: v7779.lenbits
          };
          v7800 = je(0, v7779.lens, 0, 19, v7779.lencode, 0, v7779.work, v7802);
          v7779.lenbits = v7802.bits;
          if (v7800) {
            p14172.msg = "invalid code lengths set";
            v7779.mode = pi;
            break;
          }
          v7779.have = 0;
          v7779.mode = 16198;
        case 16198:
          while (v7779.have < v7779.nlen + v7779.ndist) {
            while (vLN0908 = v7779.lencode[v7786 & (1 << v7779.lenbits) - 1], v7793 = vLN0908 >>> 24, v7794 = vLN0908 >>> 16 & 255, v7795 = vLN0908 & 65535, !(v7793 <= v7787)) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            if (v7795 < 16) {
              v7786 >>>= v7793;
              v7787 -= v7793;
              v7779.lens[v7779.have++] = v7795;
            } else {
              if (v7795 === 16) {
                for (v7803 = v7793 + 2; v7787 < v7803;) {
                  if (v7784 === 0) {
                    break _0x1f988c;
                  }
                  v7784--;
                  v7786 += v7780[v7782++] << v7787;
                  v7787 += 8;
                }
                v7786 >>>= v7793;
                v7787 -= v7793;
                if (v7779.have === 0) {
                  p14172.msg = "invalid bit length repeat";
                  v7779.mode = pi;
                  break;
                }
                v7799 = v7779.lens[v7779.have - 1];
                v7790 = 3 + (v7786 & 3);
                v7786 >>>= 2;
                v7787 -= 2;
              } else if (v7795 === 17) {
                for (v7803 = v7793 + 3; v7787 < v7803;) {
                  if (v7784 === 0) {
                    break _0x1f988c;
                  }
                  v7784--;
                  v7786 += v7780[v7782++] << v7787;
                  v7787 += 8;
                }
                v7786 >>>= v7793;
                v7787 -= v7793;
                v7799 = 0;
                v7790 = 3 + (v7786 & 7);
                v7786 >>>= 3;
                v7787 -= 3;
              } else {
                for (v7803 = v7793 + 7; v7787 < v7803;) {
                  if (v7784 === 0) {
                    break _0x1f988c;
                  }
                  v7784--;
                  v7786 += v7780[v7782++] << v7787;
                  v7787 += 8;
                }
                v7786 >>>= v7793;
                v7787 -= v7793;
                v7799 = 0;
                v7790 = 11 + (v7786 & 127);
                v7786 >>>= 7;
                v7787 -= 7;
              }
              if (v7779.have + v7790 > v7779.nlen + v7779.ndist) {
                p14172.msg = "invalid bit length repeat";
                v7779.mode = pi;
                break;
              }
              while (v7790--) {
                v7779.lens[v7779.have++] = v7799;
              }
            }
          }
          if (v7779.mode === pi) {
            break;
          }
          if (v7779.lens[256] === 0) {
            p14172.msg = "invalid code -- missing end-of-block";
            v7779.mode = pi;
            break;
          }
          v7779.lenbits = 9;
          v7802 = {
            bits: v7779.lenbits
          };
          v7800 = je(1, v7779.lens, 0, v7779.nlen, v7779.lencode, 0, v7779.work, v7802);
          v7779.lenbits = v7802.bits;
          if (v7800) {
            p14172.msg = "invalid literal/lengths set";
            v7779.mode = pi;
            break;
          }
          v7779.distbits = 6;
          v7779.distcode = v7779.distdyn;
          v7802 = {
            bits: v7779.distbits
          };
          v7800 = je(2, v7779.lens, v7779.nlen, v7779.ndist, v7779.distcode, 0, v7779.work, v7802);
          v7779.distbits = v7802.bits;
          if (v7800) {
            p14172.msg = "invalid distances set";
            v7779.mode = pi;
            break;
          }
          v7779.mode = ui;
          if (p14173 === Ze) {
            break _0x1f988c;
          }
        case ui:
          v7779.mode = ci;
        case ci:
          if (v7784 >= 6 && v7785 >= 258) {
            p14172.next_out = v7783;
            p14172.avail_out = v7785;
            p14172.next_in = v7782;
            p14172.avail_in = v7784;
            v7779.hold = v7786;
            v7779.bits = v7787;
            Ue(p14172, v7789);
            v7783 = p14172.next_out;
            v7781 = p14172.output;
            v7785 = p14172.avail_out;
            v7782 = p14172.next_in;
            v7780 = p14172.input;
            v7784 = p14172.avail_in;
            v7786 = v7779.hold;
            v7787 = v7779.bits;
            if (v7779.mode === oi) {
              v7779.back = -1;
            }
            break;
          }
          for (v7779.back = 0; vLN0908 = v7779.lencode[v7786 & (1 << v7779.lenbits) - 1], v7793 = vLN0908 >>> 24, v7794 = vLN0908 >>> 16 & 255, v7795 = vLN0908 & 65535, !(v7793 <= v7787);) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          if (v7794 && !(v7794 & 240)) {
            v7796 = v7793;
            v7797 = v7794;
            v7798 = v7795;
            while (vLN0908 = v7779.lencode[v7798 + ((v7786 & (1 << v7796 + v7797) - 1) >> v7796)], v7793 = vLN0908 >>> 24, v7794 = vLN0908 >>> 16 & 255, v7795 = vLN0908 & 65535, !(v7796 + v7793 <= v7787)) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            v7786 >>>= v7796;
            v7787 -= v7796;
            v7779.back += v7796;
          }
          v7786 >>>= v7793;
          v7787 -= v7793;
          v7779.back += v7793;
          v7779.length = v7795;
          if (v7794 === 0) {
            v7779.mode = 16205;
            break;
          }
          if (v7794 & 32) {
            v7779.back = -1;
            v7779.mode = oi;
            break;
          }
          if (v7794 & 64) {
            p14172.msg = "invalid literal/length code";
            v7779.mode = pi;
            break;
          }
          v7779.extra = v7794 & 15;
          v7779.mode = 16201;
        case 16201:
          if (v7779.extra) {
            for (v7803 = v7779.extra; v7787 < v7803;) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            v7779.length += v7786 & (1 << v7779.extra) - 1;
            v7786 >>>= v7779.extra;
            v7787 -= v7779.extra;
            v7779.back += v7779.extra;
          }
          v7779.was = v7779.length;
          v7779.mode = 16202;
        case 16202:
          while (vLN0908 = v7779.distcode[v7786 & (1 << v7779.distbits) - 1], v7793 = vLN0908 >>> 24, v7794 = vLN0908 >>> 16 & 255, v7795 = vLN0908 & 65535, !(v7793 <= v7787)) {
            if (v7784 === 0) {
              break _0x1f988c;
            }
            v7784--;
            v7786 += v7780[v7782++] << v7787;
            v7787 += 8;
          }
          if (!(v7794 & 240)) {
            v7796 = v7793;
            v7797 = v7794;
            v7798 = v7795;
            while (vLN0908 = v7779.distcode[v7798 + ((v7786 & (1 << v7796 + v7797) - 1) >> v7796)], v7793 = vLN0908 >>> 24, v7794 = vLN0908 >>> 16 & 255, v7795 = vLN0908 & 65535, !(v7796 + v7793 <= v7787)) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            v7786 >>>= v7796;
            v7787 -= v7796;
            v7779.back += v7796;
          }
          v7786 >>>= v7793;
          v7787 -= v7793;
          v7779.back += v7793;
          if (v7794 & 64) {
            p14172.msg = "invalid distance code";
            v7779.mode = pi;
            break;
          }
          v7779.offset = v7795;
          v7779.extra = v7794 & 15;
          v7779.mode = 16203;
        case 16203:
          if (v7779.extra) {
            for (v7803 = v7779.extra; v7787 < v7803;) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            v7779.offset += v7786 & (1 << v7779.extra) - 1;
            v7786 >>>= v7779.extra;
            v7787 -= v7779.extra;
            v7779.back += v7779.extra;
          }
          if (v7779.offset > v7779.dmax) {
            p14172.msg = "invalid distance too far back";
            v7779.mode = pi;
            break;
          }
          v7779.mode = 16204;
        case 16204:
          if (v7785 === 0) {
            break _0x1f988c;
          }
          v7790 = v7789 - v7785;
          if (v7779.offset > v7790) {
            v7790 = v7779.offset - v7790;
            if (v7790 > v7779.whave && v7779.sane) {
              p14172.msg = "invalid distance too far back";
              v7779.mode = pi;
              break;
            }
            if (v7790 > v7779.wnext) {
              v7790 -= v7779.wnext;
              v7791 = v7779.wsize - v7790;
            } else {
              v7791 = v7779.wnext - v7790;
            }
            if (v7790 > v7779.length) {
              v7790 = v7779.length;
            }
            v7792 = v7779.window;
          } else {
            v7792 = v7781;
            v7791 = v7783 - v7779.offset;
            v7790 = v7779.length;
          }
          if (v7790 > v7785) {
            v7790 = v7785;
          }
          v7785 -= v7790;
          v7779.length -= v7790;
          do {
            v7781[v7783++] = v7792[v7791++];
          } while (--v7790);
          if (v7779.length === 0) {
            v7779.mode = ci;
          }
          break;
        case 16205:
          if (v7785 === 0) {
            break _0x1f988c;
          }
          v7781[v7783++] = v7779.length;
          v7785--;
          v7779.mode = ci;
          break;
        case di:
          if (v7779.wrap) {
            while (v7787 < 32) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 |= v7780[v7782++] << v7787;
              v7787 += 8;
            }
            v7789 -= v7785;
            p14172.total_out += v7789;
            v7779.total += v7789;
            if (v7779.wrap & 4 && v7789) {
              p14172.adler = v7779.check = v7779.flags ? zlibCrc32(v7779.check, v7781, v7789, v7783 - v7789) : zlibAdler32(v7779.check, v7781, v7789, v7783 - v7789);
            }
            v7789 = v7785;
            if (v7779.wrap & 4 && (v7779.flags ? v7786 : fi(v7786)) !== v7779.check) {
              p14172.msg = "incorrect data check";
              v7779.mode = pi;
              break;
            }
            v7786 = 0;
            v7787 = 0;
          }
          v7779.mode = 16207;
        case 16207:
          if (v7779.wrap && v7779.flags) {
            while (v7787 < 32) {
              if (v7784 === 0) {
                break _0x1f988c;
              }
              v7784--;
              v7786 += v7780[v7782++] << v7787;
              v7787 += 8;
            }
            if (v7779.wrap & 4 && v7786 !== (v7779.total & -1)) {
              p14172.msg = "incorrect length check";
              v7779.mode = pi;
              break;
            }
            v7786 = 0;
            v7787 = 0;
          }
          v7779.mode = 16208;
        case 16208:
          v7800 = Qe;
          break _0x1f988c;
        case pi:
          v7800 = ei;
          break _0x1f988c;
        case 16210:
          return ii;
        default:
          return ti;
      }
    }
    p14172.next_out = v7783;
    p14172.avail_out = v7785;
    p14172.next_in = v7782;
    p14172.avail_in = v7784;
    v7779.hold = v7786;
    v7779.bits = v7787;
    if (v7779.wsize || v7789 !== p14172.avail_out && v7779.mode < pi && (v7779.mode < di || p14173 !== qe)) {
      Ei(p14172, p14172.output, p14172.next_out, v7789 - p14172.avail_out);
    }
    v7788 -= p14172.avail_in;
    v7789 -= p14172.avail_out;
    p14172.total_in += v7788;
    p14172.total_out += v7789;
    v7779.total += v7789;
    if (v7779.wrap & 4 && v7789) {
      p14172.adler = v7779.check = v7779.flags ? zlibCrc32(v7779.check, v7781, v7789, p14172.next_out - v7789) : zlibAdler32(v7779.check, v7781, v7789, p14172.next_out - v7789);
    }
    p14172.data_type = v7779.bits + (v7779.last ? 64 : 0) + (v7779.mode === oi ? 128 : 0) + (v7779.mode === ui || v7779.mode === li ? 256 : 0);
    if ((v7788 === 0 && v7789 === 0 || p14173 === qe) && v7800 === Je) {
      v7800 = si;
    }
    return v7800;
  },
  inflateEnd: p14174 => {
    if (vi(p14174)) {
      return ti;
    }
    let v7805 = p14174.state;
    v7805.window &&= null;
    p14174.state = null;
    return Je;
  },
  inflateGetHeader: (p14175, p14176) => {
    if (vi(p14175)) {
      return ti;
    }
    const v7806 = p14175.state;
    if (v7806.wrap & 2) {
      v7806.head = p14176;
      p14176.done = false;
      return Je;
    } else {
      return ti;
    }
  },
  inflateSetDictionary: (p14177, p14178) => {
    const v7807 = p14178.length;
    let v7808;
    let v7809;
    let v7810;
    if (vi(p14177)) {
      return ti;
    } else {
      v7808 = p14177.state;
      if (v7808.wrap !== 0 && v7808.mode !== ai) {
        return ti;
      } else if (v7808.mode === ai && (v7809 = 1, v7809 = zlibAdler32(v7809, p14178, v7807, 0), v7809 !== v7808.check)) {
        return ei;
      } else {
        v7810 = Ei(p14177, p14178, v7807, v7807);
        if (v7810) {
          v7808.mode = 16210;
          return ii;
        } else {
          v7808.havedict = 1;
          return Je;
        }
      }
    }
  },
  inflateInfo: "pako inflate (from Nodeca project)"
};
function InflateGzipHeader() {
  this.text = 0;
  this.time = 0;
  this.xflags = 0;
  this.os = 0;
  this.extra = null;
  this.extra_len = 0;
  this.name = "";
  this.comment = "";
  this.hcrc = 0;
  this.done = false;
}
const {
  Z_NO_FLUSH: Pi,
  Z_FINISH: Ri,
  Z_OK: Li,
  Z_STREAM_END: Oi,
  Z_NEED_DICT: Fi,
  Z_STREAM_ERROR: Di,
  Z_DATA_ERROR: ki,
  Z_MEM_ERROR: Ii
} = zlibConstants;
function ZlibInflateStream(p14179) {
  this.options = assignPartial({
    chunkSize: 65536,
    windowBits: 15,
    to: ""
  }, p14179 || {});
  const v7811 = this.options;
  if (v7811.raw && v7811.windowBits >= 0 && v7811.windowBits < 16) {
    v7811.windowBits = -v7811.windowBits;
    if (v7811.windowBits === 0) {
      v7811.windowBits = -15;
    }
  }
  if (!!(v7811.windowBits >= 0) && !!(v7811.windowBits < 16) && (!p14179 || !p14179.windowBits)) {
    v7811.windowBits += 32;
  }
  if (v7811.windowBits > 15 && v7811.windowBits < 48) {
    if (!(v7811.windowBits & 15)) {
      v7811.windowBits |= 15;
    }
  }
  this.err = 0;
  this.msg = "";
  this.ended = false;
  this.chunks = [];
  this.strm = new ZlibStreamState();
  this.strm.avail_out = 0;
  let v7812 = inflateAPI.inflateInit2(this.strm, v7811.windowBits);
  if (v7812 !== Li) {
    throw new Error(zlibErrMsgs[v7812]);
  }
  this.header = new InflateGzipHeader();
  inflateAPI.inflateGetHeader(this.strm, this.header);
  if (v7811.dictionary && (typeof v7811.dictionary == "string" ? v7811.dictionary = be(v7811.dictionary) : objectPrototypeToString.call(v7811.dictionary) === "[object ArrayBuffer]" && (v7811.dictionary = new Uint8Array(v7811.dictionary)), v7811.raw && (v7812 = inflateAPI.inflateSetDictionary(this.strm, v7811.dictionary), v7812 !== Li))) {
    throw new Error(zlibErrMsgs[v7812]);
  }
}
function zlibInflateToResult(p14180, p14181) {
  const v7813 = new ZlibInflateStream(p14181);
  v7813.push(p14180);
  if (v7813.err) {
    throw v7813.msg || zlibErrMsgs[v7813.err];
  }
  return v7813.result;
}
ZlibInflateStream.prototype.push = function (p14182, p14183) {
  const v7814 = this.strm;
  const v7815 = this.options.chunkSize;
  const v7816 = this.options.dictionary;
  let v7817;
  let v7818;
  let v7819;
  if (this.ended) {
    return false;
  }
  v7818 = p14183 === ~~p14183 ? p14183 : p14183 === true ? Ri : Pi;
  if (objectPrototypeToString.call(p14182) === "[object ArrayBuffer]") {
    v7814.input = new Uint8Array(p14182);
  } else {
    v7814.input = p14182;
  }
  v7814.next_in = 0;
  v7814.avail_in = v7814.input.length;
  while (true) {
    if (v7814.avail_out === 0) {
      v7814.output = new Uint8Array(v7815);
      v7814.next_out = 0;
      v7814.avail_out = v7815;
    }
    v7817 = inflateAPI.inflate(v7814, v7818);
    if (v7817 === Fi && v7816) {
      v7817 = inflateAPI.inflateSetDictionary(v7814, v7816);
      if (v7817 === Li) {
        v7817 = inflateAPI.inflate(v7814, v7818);
      } else if (v7817 === ki) {
        v7817 = Fi;
      }
    }
    while (v7814.avail_in > 0 && v7817 === Oi && v7814.state.wrap > 0 && p14182[v7814.next_in] !== 0) {
      inflateAPI.inflateReset(v7814);
      v7817 = inflateAPI.inflate(v7814, v7818);
    }
    switch (v7817) {
      case Di:
      case ki:
      case Fi:
      case Ii:
        this.onEnd(v7817);
        this.ended = true;
        return false;
    }
    v7819 = v7814.avail_out;
    if (v7814.next_out && (v7814.avail_out === 0 || v7817 === Oi)) {
      if (this.options.to === "string") {
        let vEe = Ee(v7814.output, v7814.next_out);
        let v7820 = v7814.next_out - vEe;
        let vSe = Se(v7814.output, vEe);
        v7814.next_out = v7820;
        v7814.avail_out = v7815 - v7820;
        if (v7820) {
          v7814.output.set(v7814.output.subarray(vEe, vEe + v7820), 0);
        }
        this.onData(vSe);
      } else {
        this.onData(v7814.output.length === v7814.next_out ? v7814.output : v7814.output.subarray(0, v7814.next_out));
      }
    }
    if (v7817 !== Li || v7819 !== 0) {
      if (v7817 === Oi) {
        v7817 = inflateAPI.inflateEnd(this.strm);
        this.onEnd(v7817);
        this.ended = true;
        return true;
      }
      if (v7814.avail_in === 0) {
        break;
      }
    }
  }
  return true;
};
ZlibInflateStream.prototype.onData = function (p14184) {
  this.chunks.push(p14184);
};
ZlibInflateStream.prototype.onEnd = function (p14185) {
  if (p14185 === Li) {
    if (this.options.to === "string") {
      this.result = this.chunks.join("");
    } else {
      this.result = _e(this.chunks);
    }
  }
  this.chunks = [];
  this.err = p14185;
  this.msg = this.strm.msg;
};
const {
  Deflate: Yi,
  deflate: Ui,
  deflateRaw: zi,
  gzip: Gi
} = zlibDeflateEngine;
var zlibExports = {
  Deflate: Yi,
  deflate: Ui,
  deflateRaw: zi,
  gzip: Gi,
  Inflate: ZlibInflateStream,
  inflate: zlibInflateToResult,
  inflateRaw: function (p14186, p14187) {
    (p14187 = p14187 || {}).raw = true;
    return zlibInflateToResult(p14186, p14187);
  },
  ungzip: zlibInflateToResult,
  constants: zlibConstants
};
function parseGjLevelObjectRecord(p14188) {
  let v7821 = p14188.split(",");
  let vO200 = {};
  for (let vLN0909 = 0; vLN0909 + 1 < v7821.length; vLN0909 += 2) {
    let vParseInt22 = parseInt(v7821[vLN0909], 10);
    let v7822 = v7821[vLN0909 + 1];
    vO200[vParseInt22] = v7822;
  }
  let vParseInt23 = parseInt(vO200[1] || "0", 10);
  if (vParseInt23 === 0) {
    return null;
  } else {
    return {
      id: vParseInt23,
      x: parseFloat(vO200[2] || "0"),
      y: parseFloat(vO200[3] || "0"),
      flipX: vO200[4] === "1",
      flipY: vO200[5] === "1",
      rot: parseFloat(vO200[6] || "0"),
      scale: parseFloat(vO200[32] || "1"),
      zLayer: parseInt(vO200[24] || "0", 10),
      zOrder: parseInt(vO200[25] || "0", 10),
      groups: vO200[57] || "",
      color1: parseInt(vO200[21] || "0", 10),
      color2: parseInt(vO200[22] || "0", 10),
      _raw: vO200
    };
  }
}
function parseCompressedGjLevelString(p14189) {
  let decoded = function (b64) {
    let normalized = function (s) {
      let pad = s.replace(/-/g, "+").replace(/_/g, "/");
      while (pad.length % 4 != 0) {
        pad += "=";
      }
      return pad;
    }(b64.trim());
    let binary = atob(normalized);
    let bytes = new Uint8Array(binary.length);
    for (let bi = 0; bi < binary.length; bi++) {
      bytes[bi] = binary.charCodeAt(bi);
    }
    let inflated = zlibExports.inflate(bytes);
    return new TextDecoder().decode(inflated);
  }(p14189);
  let parts = decoded.split(";");
  let settingsHeader = parts.length > 0 ? parts[0] : "";
  let objects = [];
  for (let oi = 1; oi < parts.length; oi++) {
    if (parts[oi].length === 0) {
      continue;
    }
    let parsedObject = parseGjLevelObjectRecord(parts[oi]);
    if (parsedObject) {
      objects.push(parsedObject);
    }
  }
  return {
    settings: settingsHeader,
    objects: objects
  };
}

// object type tags used by the registry and GameLevel collision/spawn logic
const objectTypeDeco = "deco";
const objectTypePortal = "portal";
const objectTypePad = "pad";
const objectTypeRing = "ring";
const objectTypeTrigger = "trigger";
const objectTypeSpeed = "speed";
const objectTypeFlyMode = "fly";
const objectTypeCubeMode = "cube";

// object registry data: assets/data/objects.json (loaded in BootScene, see initobjectsFromJson)
let gjObjectById = {};
function initobjectsFromJson(pack) {
  gjObjectById = {};
  if (!pack || typeof pack.objects !== "object") {
    return;
  }
  const raw = pack.objects;
  for (const key of Object.keys(raw)) {
    gjObjectById[+key] = raw[key];
  }
  const glowIds = pack.glowObjectIds || [];
  for (let gi = 0; gi < glowIds.length; gi++) {
    const oid = glowIds[gi];
    if (gjObjectById[oid]) {
      gjObjectById[oid].glow = true;
    }
  }
}
function getGjObjectById(p14192) {
  return gjObjectById[p14192] || null;
}
