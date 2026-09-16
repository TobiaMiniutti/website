/*!
 * liquid-glass.js — vendored from deepika-builds/liquid-glass
 * Upstream commit: 98ed97bd99def529493fd37177228810f6422f6d
 * Copyright (c) 2026 Deepika Rao — MIT License
 * Full notice distributed alongside this file: liquid-glass.LICENSE.txt
 */
(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  let svgDefs = null;

  const supported = (() => {
    const ua = navigator.userAgent;
    const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
    const isFirefox = /Firefox/.test(ua);
    if (isSafari || isFirefox) return false;
    if (!CSS.supports("backdrop-filter", "url(#lg)")) return false;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 4;
      const context = canvas.getContext("2d");
      if (!context || typeof context.roundRect !== "function" || typeof ResizeObserver !== "function") return false;
      context.getImageData(0, 0, 1, 1);
      return true;
    } catch (_) {
      return false;
    }
  })();

  function ensureDefs() {
    if (svgDefs) return svgDefs;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svgDefs = document.createElementNS(SVG_NS, "defs");
    svg.appendChild(svgDefs);
    document.body.appendChild(svg);
    return svgDefs;
  }

  function makeMap(width, height, radius, border, mapBlur) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    const horizontal = context.createLinearGradient(0, 0, width, 0);
    horizontal.addColorStop(0, "rgb(0,0,0)");
    horizontal.addColorStop(1, "rgb(255,0,0)");
    context.fillStyle = horizontal;
    context.fillRect(0, 0, width, height);

    const vertical = context.createLinearGradient(0, 0, 0, height);
    vertical.addColorStop(0, "rgb(0,0,0)");
    vertical.addColorStop(1, "rgb(0,0,255)");
    context.globalCompositeOperation = "difference";
    context.fillStyle = vertical;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "source-over";

    const inset = border * Math.min(width, height);
    context.filter = `blur(${mapBlur}px)`;
    context.fillStyle = "rgba(128,128,128,0.93)";
    context.beginPath();
    context.roundRect(inset, inset, width - inset * 2, height - inset * 2, Math.max(radius - inset, 2));
    context.fill();
    context.filter = "none";
    return canvas.toDataURL();
  }

  function buildFilter(id, scales) {
    const filter = document.createElementNS(SVG_NS, "filter");
    filter.setAttribute("id", id);
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", "100%");
    filter.setAttribute("height", "100%");
    filter.setAttribute("color-interpolation-filters", "sRGB");

    const image = document.createElementNS(SVG_NS, "feImage");
    image.setAttribute("x", "0");
    image.setAttribute("y", "0");
    image.setAttribute("result", "map");
    image.setAttribute("preserveAspectRatio", "none");
    filter.appendChild(image);

    const keep = [
      "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
      "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
      "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
    ];
    const channels = [];

    for (let index = 0; index < 3; index += 1) {
      const displacement = document.createElementNS(SVG_NS, "feDisplacementMap");
      displacement.setAttribute("in", "SourceGraphic");
      displacement.setAttribute("in2", "map");
      displacement.setAttribute("scale", scales[index]);
      displacement.setAttribute("xChannelSelector", "R");
      displacement.setAttribute("yChannelSelector", "B");
      displacement.setAttribute("result", `d${index}`);
      filter.appendChild(displacement);

      const matrix = document.createElementNS(SVG_NS, "feColorMatrix");
      matrix.setAttribute("in", `d${index}`);
      matrix.setAttribute("type", "matrix");
      matrix.setAttribute("values", keep[index]);
      matrix.setAttribute("result", `c${index}`);
      filter.appendChild(matrix);
      channels.push(`c${index}`);
    }

    const firstBlend = document.createElementNS(SVG_NS, "feBlend");
    firstBlend.setAttribute("in", channels[0]);
    firstBlend.setAttribute("in2", channels[1]);
    firstBlend.setAttribute("mode", "screen");
    firstBlend.setAttribute("result", "c01");
    filter.appendChild(firstBlend);

    const secondBlend = document.createElementNS(SVG_NS, "feBlend");
    secondBlend.setAttribute("in", "c01");
    secondBlend.setAttribute("in2", channels[2]);
    secondBlend.setAttribute("mode", "screen");
    filter.appendChild(secondBlend);
    ensureDefs().appendChild(filter);
    return { filter, image };
  }

  function resolveRadius(element, width, height, override) {
    if (override != null) return override;
    const raw = getComputedStyle(element).borderTopLeftRadius || "0px";
    const value = parseFloat(raw) || 0;
    return raw.trim().endsWith("%") ? (value / 100) * Math.min(width, height) : value;
  }

  function liquidGlass(element, options) {
    const settings = Object.assign({
      scale: -112,
      chroma: 6,
      border: 0.07,
      mapBlur: 12,
      mapResolution: 0.5,
      blur: 3,
      saturate: 1.5,
      radius: null,
      fallbackBlur: 16,
    }, options);

    const previousBackdrop = element.style.backdropFilter;
    const previousWebkitBackdrop = element.style.webkitBackdropFilter;

    if (!supported) {
      const frosted = `blur(${settings.fallbackBlur}px) saturate(${settings.saturate})`;
      element.style.backdropFilter = frosted;
      element.style.webkitBackdropFilter = frosted;
      element.classList.add("lg-fallback");
      return {
        supported: false,
        refresh() {},
        destroy() {
          element.style.backdropFilter = previousBackdrop;
          element.style.webkitBackdropFilter = previousWebkitBackdrop;
          element.classList.remove("lg-fallback");
        },
      };
    }

    const id = `lg-filter-${++uid}`;
    const scales = [settings.scale, settings.scale + settings.chroma, settings.scale + 2 * settings.chroma];
    const parts = buildFilter(id, scales);

    let lastWidth = 0;
    let lastHeight = 0;

    function refresh(force = false) {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      if (!width || !height) return;
      if (!force && width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;

      const resolution = Math.min(1, Math.max(0.25, Number(settings.mapResolution) || 0.5));
      const mapWidth = Math.max(2, Math.round(width * resolution));
      const mapHeight = Math.max(2, Math.round(height * resolution));
      const radius = resolveRadius(element, width, height, settings.radius);
      parts.image.setAttribute("href", makeMap(
        mapWidth,
        mapHeight,
        radius * resolution,
        settings.border,
        settings.mapBlur * resolution,
      ));
      parts.image.setAttribute("width", width);
      parts.image.setAttribute("height", height);
    }

    refresh(true);
    element.style.backdropFilter = `url(#${id}) blur(${settings.blur}px) saturate(${settings.saturate})`;

    let timer = null;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 120);
    });
    observer.observe(element);

    return {
      supported: true,
      refresh,
      destroy() {
        observer.disconnect();
        clearTimeout(timer);
        parts.filter.remove();
        element.style.backdropFilter = previousBackdrop;
        element.style.webkitBackdropFilter = previousWebkitBackdrop;
      },
    };
  }

  global.liquidGlass = liquidGlass;
})(window);
