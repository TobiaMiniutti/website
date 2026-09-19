"use strict";

document.documentElement.classList.remove("no-js");

const year = document.querySelector("[data-current-year]");
if (year) year.textContent = String(new Date().getFullYear());

const header = document.querySelector(".site-header");
let headerFrame = 0;
const updateHeader = () => {
  headerFrame = 0;
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};
const requestHeaderUpdate = () => {
  if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
};
updateHeader();
window.addEventListener("scroll", requestHeaderUpdate, { passive: true });

const menu = document.querySelector("#mobile-menu");
const openButton = document.querySelector(".menu-toggle");
const closeButton = menu?.querySelector(".menu-close");

if (menu instanceof HTMLDialogElement && openButton instanceof HTMLButtonElement) {
  const compactNavigation = window.matchMedia("(max-width: 920px)");
  let restoreMenuFocus = true;
  const setMenuState = (expanded) => {
    openButton.setAttribute("aria-expanded", String(expanded));
    openButton.setAttribute("aria-label", expanded ? "Chiudi il menu" : "Apri il menu");
  };
  const canRestoreMenuFocus = () => openButton.isConnected && openButton.getClientRects().length > 0;
  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!menu.open) return;
    restoreMenuFocus = restoreFocus;
    menu.close();
  };
  openButton.addEventListener("click", () => {
    if (menu.open) return;
    restoreMenuFocus = true;
    menu.showModal();
    setMenuState(true);
    closeButton?.focus();
  });
  closeButton?.addEventListener("click", closeMenu);
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  menu.addEventListener("click", (event) => {
    if (event.target === menu) closeMenu();
  });
  menu.addEventListener("close", () => {
    setMenuState(false);
    if (restoreMenuFocus && canRestoreMenuFocus()) openButton.focus();
    restoreMenuFocus = true;
  });
  compactNavigation.addEventListener?.("change", (event) => {
    if (!event.matches) closeMenu({ restoreFocus: false });
  });
  setMenuState(false);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const reduceTransparency = window.matchMedia("(prefers-reduced-transparency: reduce)");
const navShell = document.querySelector(".nav-shell");
let glassController = null;

const destroyGlass = () => {
  glassController?.destroy();
  glassController = null;
  navShell?.classList.remove("has-liquid-glass", "glass-frosted");
};

const setupGlass = () => {
  destroyGlass();
  if (!(navShell instanceof HTMLElement)) return;
  navShell.classList.toggle("glass-opaque", reduceTransparency.matches);
  if (reduceTransparency.matches || typeof window.liquidGlass !== "function") return;

  try {
    glassController = window.liquidGlass(navShell, {
      scale: -62,
      chroma: 1.5,
      border: 0.11,
      mapBlur: 15,
      mapResolution: 0.5,
      blur: 5,
      saturate: 1.12,
      fallbackBlur: 18,
    });
    navShell.classList.add(glassController.supported ? "has-liquid-glass" : "glass-frosted");
  } catch (_) {
    destroyGlass();
    navShell.classList.add("glass-opaque");
  }
};

requestAnimationFrame(setupGlass);
reduceTransparency.addEventListener?.("change", setupGlass);
window.addEventListener("pagehide", destroyGlass);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) requestAnimationFrame(setupGlass);
});

const garden = document.querySelector("[data-garden-scene]");
if (garden instanceof HTMLElement) {
  const layers = [...garden.querySelectorAll("[data-parallax-layer]")];
  const pointerSurface = garden.closest(".garden-hero") || garden;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const planeSettings = {
    desktop: {
      distance: { scale: 1.03, pointer: 1.5, outward: 0.08 },
      midground: { scale: 1.15, pointer: 3, outward: 0.13 },
      foreground: { scale: 1.46, pointer: 5, outward: 0.18 },
      vanishingX: 0.58,
      vanishingY: 0.61,
    },
    mobile: {
      distance: { scale: 1.025, pointer: 0, outward: 0.06 },
      midground: { scale: 1.1, pointer: 0, outward: 0.1 },
      foreground: { scale: 1.36, pointer: 0, outward: 0.14 },
      vanishingX: 0.52,
      vanishingY: 0.63,
    },
  };
  let visible = true;
  let gardenFrame = 0;
  let pointerFrame = 0;
  let geometryDirty = true;
  let cameraStart = 0;
  let cameraEnd = 1;
  let cameraWidth = 1;
  let cameraHeight = 1;
  let cameraLeft = 0;

  const layerPlane = (layer) => {
    if (layer.classList.contains("garden-foreground")) return "foreground";
    if (layer.classList.contains("garden-midground")) return "midground";
    return "distance";
  };

  const resetLayer = (layer) => {
    layer.style.setProperty("--camera-scale", "1");
    layer.style.setProperty("--camera-x", "0px");
    layer.style.setProperty("--camera-y", "0px");
    layer.style.setProperty("--pointer-x", "0px");
    layer.style.setProperty("--pointer-y", "0px");
  };

  const setStaticGarden = () => {
    garden.dataset.cameraMode = "static";
    garden.dataset.cameraProgress = "0.0000";
    garden.style.setProperty("--garden-progress", "0");
    garden.style.setProperty("--vanishing-x", "50%");
    garden.style.setProperty("--vanishing-y", "50%");
    layers.forEach(resetLayer);
  };

  const measureGarden = () => {
    const bounds = pointerSurface.getBoundingClientRect();
    cameraStart = window.scrollY + bounds.top;
    cameraWidth = Math.max(bounds.width, 1);
    cameraHeight = Math.max(bounds.height, 1);
    cameraLeft = bounds.left;
    cameraEnd = cameraStart + cameraHeight;
    geometryDirty = false;
    garden.dataset.cameraStart = cameraStart.toFixed(2);
    garden.dataset.cameraEnd = cameraEnd.toFixed(2);
  };

  const renderGarden = () => {
    gardenFrame = 0;
    if (reduceMotion.matches) {
      setStaticGarden();
      return;
    }
    if (!visible || document.hidden) return;
    if (geometryDirty) measureGarden();

    const progress = Math.min(1, Math.max(0, (window.scrollY - cameraStart) / (cameraEnd - cameraStart)));
    const mode = window.innerWidth <= 680 ? "mobile" : "desktop";
    const settings = planeSettings[mode];
    garden.dataset.cameraMode = "immersive";
    garden.dataset.cameraProgress = progress.toFixed(4);
    garden.style.setProperty("--garden-progress", progress.toFixed(4));
    garden.style.setProperty("--vanishing-x", `${settings.vanishingX * 100}%`);
    garden.style.setProperty("--vanishing-y", `${settings.vanishingY * 100}%`);

    layers.forEach((layer) => {
      const plane = settings[layerPlane(layer)];
      const scale = 1 + (plane.scale - 1) * progress;
      const outwardX = (0.5 - settings.vanishingX) * cameraWidth * (scale - 1) * plane.outward;
      const outwardY = (0.5 - settings.vanishingY) * cameraHeight * (scale - 1) * plane.outward;
      layer.style.setProperty("--camera-scale", scale.toFixed(4));
      layer.style.setProperty("--camera-x", `${outwardX.toFixed(2)}px`);
      layer.style.setProperty("--camera-y", `${outwardY.toFixed(2)}px`);
    });
  };

  const requestGardenRender = () => {
    if (!gardenFrame) gardenFrame = requestAnimationFrame(renderGarden);
  };
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestGardenRender();
  }, { rootMargin: "25% 0px 25% 0px" });
  visibilityObserver.observe(garden);
  window.addEventListener("scroll", requestGardenRender, { passive: true });
  const invalidateGardenGeometry = () => {
    geometryDirty = true;
    requestGardenRender();
  };
  window.addEventListener("resize", invalidateGardenGeometry, { passive: true });
  window.addEventListener("orientationchange", invalidateGardenGeometry, { passive: true });
  document.addEventListener("visibilitychange", requestGardenRender);
  window.addEventListener("pageshow", invalidateGardenGeometry);
  document.fonts?.ready.then(invalidateGardenGeometry).catch(() => {});
  const gardenResizeObserver = typeof ResizeObserver === "function"
    ? new ResizeObserver(invalidateGardenGeometry)
    : null;
  gardenResizeObserver?.observe(pointerSurface);
  reduceMotion.addEventListener?.("change", invalidateGardenGeometry);
  requestGardenRender();

  pointerSurface.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reduceMotion.matches || !visible || document.hidden) return;
      if (geometryDirty) measureGarden();
      const surfaceTop = cameraStart - window.scrollY;
      const pointerX = ((event.clientX - cameraLeft) / cameraWidth - 0.5) * 2;
      const pointerY = ((event.clientY - surfaceTop) / cameraHeight - 0.5) * 2;
      if (!pointerFrame) {
        pointerFrame = requestAnimationFrame(() => {
          pointerFrame = 0;
          const mode = window.innerWidth <= 680 ? "mobile" : "desktop";
          const settings = planeSettings[mode];
          layers.forEach((layer) => {
            const response = settings[layerPlane(layer)].pointer;
            layer.style.setProperty("--pointer-x", `${(pointerX * response).toFixed(2)}px`);
            layer.style.setProperty("--pointer-y", `${(pointerY * response).toFixed(2)}px`);
          });
        });
      }
  }, { passive: true });
  pointerSurface.addEventListener("pointerleave", () => {
      layers.forEach((layer) => {
        layer.style.setProperty("--pointer-x", "0px");
        layer.style.setProperty("--pointer-y", "0px");
      });
  });
}

const createAmbientGarden = () => {
  const birdStops = [...document.querySelectorAll("[data-bird-stop]")]
    .filter((element) => element instanceof HTMLElement);
  const leafZones = [...document.querySelectorAll("[data-leaf-zone]")]
    .filter((element) => element instanceof HTMLElement);
  if (!birdStops.length && !leafZones.length) return null;

  const supportsLeafMotion = typeof Element.prototype.animate === "function";
  const leafPaths = [
    {
      x: [1, 4, 1, 6],
      rotation: [-18, 42, 94, 156],
      duration: 7200,
      delay: 0,
    },
    {
      x: [99, 96, 99, 94],
      rotation: [14, -36, -88, -142],
      duration: 7900,
      delay: 280,
    },
    {
      x: [94, 89, 96, 91],
      rotation: [34, 86, 138, 206],
      duration: 8400,
      delay: 620,
    },
  ];
  const activeLeafZones = new Set();
  const runningAnimations = new Set();
  const leafAnimations = new WeakMap();
  const timers = new Set();
  let root = null;
  let bird = null;
  let leaves = [];
  let leafObserver = null;
  let ambientFrame = 0;
  let burstIndex = 0;
  let lastBurstAt = -Infinity;
  let destroyed = false;

  const ensureRoot = () => {
    if (destroyed || root) return root;
    root = document.createElement("div");
    root.className = "ambient-garden";
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("inert", "");
    root.inert = true;
    root.style.pointerEvents = "none";

    if (birdStops.length) {
      bird = document.createElement("span");
      bird.className = "ambient-bird";
      bird.dataset.state = "hidden";
      bird.dataset.pose = "glide";
      bird.style.setProperty("--bird-opacity", "0");
      root.append(bird);
    }

    if (leafZones.length && supportsLeafMotion) {
      leaves = leafPaths.map((_, index) => {
        const leaf = document.createElement("span");
        leaf.className = "ambient-leaf";
        leaf.dataset.leafVariant = String(index);
        leaf.hidden = true;
        root.append(leaf);
        return leaf;
      });
    }

    document.body.append(root);
    return root;
  };

  const finishLeafAnimation = (animation, leaf) => {
    runningAnimations.delete(animation);
    if (leaf instanceof HTMLElement && leafAnimations.get(leaf) === animation) {
      leafAnimations.delete(leaf);
      leaf.hidden = true;
    }
  };

  const animateLeaf = (leaf, path, index) => {
    if (destroyed || document.hidden || !activeLeafZones.size || !ensureRoot()) return;
    leafAnimations.get(leaf)?.cancel();
    leaf.hidden = false;
    leaf.dataset.leafVariant = String((index + burstIndex) % leafPaths.length);
    const animation = leaf.animate([
      {
        opacity: 0,
        transform: `translate3d(${path.x[0]}vw, -14vh, 0) rotate(${path.rotation[0]}deg)`,
      },
      {
        opacity: 0.72,
        transform: `translate3d(${path.x[1]}vw, 20vh, 0) rotate(${path.rotation[1]}deg)`,
        offset: 0.24,
      },
      {
        opacity: 0.66,
        transform: `translate3d(${path.x[2]}vw, 67vh, 0) rotate(${path.rotation[2]}deg)`,
        offset: 0.7,
      },
      {
        opacity: 0,
        transform: `translate3d(${path.x[3]}vw, 112vh, 0) rotate(${path.rotation[3]}deg)`,
      },
    ], {
      duration: path.duration,
      easing: "cubic-bezier(0.42, 0, 0.3, 1)",
      fill: "none",
    });
    leafAnimations.set(leaf, animation);
    runningAnimations.add(animation);
    animation.finished
      .then(() => finishLeafAnimation(animation, leaf))
      .catch(() => finishLeafAnimation(animation, leaf));
  };

  const runLeafBurst = () => {
    if (destroyed || document.hidden || !activeLeafZones.size || !supportsLeafMotion) return;
    const now = performance.now();
    if (now - lastBurstAt < 3600) return;
    lastBurstAt = now;
    burstIndex += 1;
    ensureRoot();
    leaves.forEach((leaf, index) => {
      const path = leafPaths[index];
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        animateLeaf(leaf, path, index);
      }, path.delay);
      timers.add(timer);
    });
  };

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const mix = (start, end, progress) => start + (end - start) * progress;

  const birdPresentation = () => {
    const viewportHeight = Math.max(window.innerHeight, 1);
    let candidate = null;

    birdStops.forEach((stop, index) => {
      const bounds = stop.getBoundingClientRect();
      const anchorY = bounds.top + Math.min(Math.max(bounds.height * 0.3, 18), 84);
      const relative = anchorY / viewportHeight - 0.5;
      if (relative < -0.88 || relative > 1.18) return;
      const score = Math.abs(relative - 0.04);
      if (!candidate || score < candidate.score) {
        candidate = { index, anchorY, relative, score };
      }
    });

    if (!candidate) return { state: "hidden", pose: "glide", opacity: 0 };

    const perchX = window.innerWidth <= 680 ? 94 : 92;
    const perchY = clamp(candidate.anchorY / viewportHeight * 100, 16, 76);
    const presentation = {
      state: "perched",
      pose: "perched",
      opacity: 1,
      x: perchX,
      y: perchY,
      rotation: 0,
      scale: 1,
      stop: candidate.index,
    };

    if (candidate.relative > 0.62) {
      const progress = clamp((1.18 - candidate.relative) / 0.56, 0, 1);
      presentation.state = "flying";
      presentation.pose = Math.floor(progress * 6) % 2 === 0 ? "wing-up" : "wing-down";
      presentation.opacity = clamp(progress * 1.6, 0, 1);
      presentation.x = mix(108, perchX + 5, progress);
      presentation.y = mix(18, perchY - 8, progress);
      presentation.rotation = mix(-8, -3, progress);
      presentation.scale = mix(0.82, 0.96, progress);
    } else if (candidate.relative > 0.2) {
      const progress = clamp((0.62 - candidate.relative) / 0.42, 0, 1);
      presentation.state = "approaching";
      presentation.pose = progress < 0.48 ? "wing-down" : "glide";
      presentation.x = mix(perchX + 5, perchX, progress);
      presentation.y = mix(perchY - 8, perchY, progress);
      presentation.rotation = mix(-3, 0, progress);
      presentation.scale = mix(0.96, 1, progress);
    } else if (candidate.relative < -0.25) {
      const progress = clamp((-0.25 - candidate.relative) / 0.63, 0, 1);
      presentation.state = "leaving";
      presentation.pose = progress < 0.34 ? "glide" : (Math.floor(progress * 6) % 2 ? "wing-up" : "wing-down");
      presentation.opacity = clamp((1 - progress) * 1.8, 0, 1);
      presentation.x = mix(perchX, 110, progress);
      presentation.y = mix(perchY, 8, progress);
      presentation.rotation = mix(0, -9, progress);
      presentation.scale = mix(1, 0.82, progress);
    }

    return presentation;
  };

  const renderBird = () => {
    ambientFrame = 0;
    if (destroyed || document.hidden || !birdStops.length) return;
    const presentation = birdPresentation();
    if (presentation.state === "hidden" && !root) return;
    ensureRoot();
    if (!(bird instanceof HTMLElement)) return;
    bird.dataset.state = presentation.state;
    bird.dataset.pose = presentation.pose;
    if (Number.isInteger(presentation.stop)) bird.dataset.stopIndex = String(presentation.stop);
    else delete bird.dataset.stopIndex;
    bird.style.setProperty("--bird-opacity", String(presentation.opacity));
    if (typeof presentation.x === "number") bird.style.setProperty("--bird-x", `${presentation.x.toFixed(2)}vw`);
    if (typeof presentation.y === "number") bird.style.setProperty("--bird-y", `${presentation.y.toFixed(2)}vh`);
    if (typeof presentation.rotation === "number") {
      bird.style.setProperty("--bird-rotation", `${presentation.rotation.toFixed(2)}deg`);
    }
    if (typeof presentation.scale === "number") bird.style.setProperty("--bird-scale", presentation.scale.toFixed(3));
  };

  const requestAmbientRender = () => {
    if (!ambientFrame && !destroyed) ambientFrame = requestAnimationFrame(renderBird);
  };

  const handleVisibility = () => {
    runningAnimations.forEach((animation) => {
      if (document.hidden) animation.pause();
      else animation.play();
    });
    if (!document.hidden) {
      requestAmbientRender();
      if (activeLeafZones.size) runLeafBurst();
    }
  };

  if (leafZones.length && supportsLeafMotion && "IntersectionObserver" in window) {
    leafObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const wasActive = activeLeafZones.has(entry.target);
          activeLeafZones.add(entry.target);
          if (!wasActive) runLeafBurst();
        } else {
          activeLeafZones.delete(entry.target);
        }
      });
    }, { rootMargin: "-8% 0px -14%", threshold: 0.08 });
    leafZones.forEach((zone) => leafObserver.observe(zone));
  }

  window.addEventListener("scroll", requestAmbientRender, { passive: true });
  window.addEventListener("resize", requestAmbientRender, { passive: true });
  window.addEventListener("orientationchange", requestAmbientRender, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  requestAmbientRender();

  return {
    destroy() {
      destroyed = true;
      leafObserver?.disconnect();
      if (ambientFrame) cancelAnimationFrame(ambientFrame);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      runningAnimations.forEach((animation) => animation.cancel());
      runningAnimations.clear();
      window.removeEventListener("scroll", requestAmbientRender);
      window.removeEventListener("resize", requestAmbientRender);
      window.removeEventListener("orientationchange", requestAmbientRender);
      document.removeEventListener("visibilitychange", handleVisibility);
      root?.remove();
    },
  };
};

let ambientGardenController = null;
const setupAmbientGarden = () => {
  ambientGardenController?.destroy();
  ambientGardenController = reduceMotion.matches ? null : createAmbientGarden();
};
setupAmbientGarden();
reduceMotion.addEventListener?.("change", setupAmbientGarden);
window.addEventListener("pagehide", () => {
  ambientGardenController?.destroy();
  ambientGardenController = null;
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) setupAmbientGarden();
});

if (!reduceMotion.matches && "IntersectionObserver" in window && Element.prototype.animate) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const delay = Math.min(180, Number(entry.target.dataset.revealDelay || 0));
      entry.target.animate([
        { opacity: 0.72, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 620, delay, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "none" });
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
  document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
}

const initializeGallery = (gallery) => {
  if (!(gallery instanceof HTMLElement) || gallery.dataset.galleryInitialized === "true") return;
  gallery.dataset.galleryInitialized = "true";

  const dialog = gallery.querySelector("[data-gallery-dialog]");
  const dialogImage = gallery.querySelector("[data-gallery-full]");
  const dialogCaption = dialog?.querySelector("[data-gallery-caption]");
  const originalLink = gallery.querySelector("[data-gallery-original]");
  const status = gallery.querySelector("[data-gallery-status]");
  const previousButton = gallery.querySelector("[data-gallery-prev]");
  const nextButton = gallery.querySelector("[data-gallery-next]");
  const closeGalleryButton = gallery.querySelector("[data-gallery-close]");
  let currentIndex = 0;
  let opener = null;

  const items = () => [...gallery.querySelectorAll("[data-gallery-item]")];
  const buttons = () => items().map((item) => item.querySelector("[data-gallery-open]")).filter(Boolean);
  const focusFallback = () => [...document.querySelectorAll(".site-brand, main a[href], footer a[href]")]
    .find((element) => element instanceof HTMLElement && !gallery.contains(element) && !element.hidden);
  const closeGallery = () => {
    if (dialog instanceof HTMLDialogElement && dialog.open) dialog.close();
  };
  const removeFailedItem = (item) => {
    item?.remove();
    const remaining = items();
    if (!remaining.length) {
      const fallback = focusFallback();
      closeGallery();
      gallery.remove();
      requestAnimationFrame(() => {
        if (opener?.isConnected) opener.focus();
        else if (fallback instanceof HTMLElement) fallback.focus();
      });
      return;
    }
    currentIndex = Math.min(currentIndex, remaining.length - 1);
  };
  const renderDialog = (index) => {
    const galleryButtons = buttons();
    if (!galleryButtons.length || !(dialogImage instanceof HTMLImageElement)) return;
    currentIndex = (index + galleryButtons.length) % galleryButtons.length;
    const button = galleryButtons[currentIndex];
    const total = galleryButtons.length;
    dialogImage.src = button.dataset.gallerySrc || "";
    dialogImage.alt = button.dataset.galleryAlt || "";
    dialogImage.width = Number(button.dataset.galleryWidth) || 1;
    dialogImage.height = Number(button.dataset.galleryHeight) || 1;
    if (dialogCaption) dialogCaption.textContent = button.dataset.galleryCaption || "";
    if (originalLink instanceof HTMLAnchorElement) originalLink.href = button.dataset.gallerySrc || "";
    if (status) status.textContent = `Schermata ${currentIndex + 1} di ${total}`;
    [previousButton, nextButton].forEach((control) => {
      if (control instanceof HTMLElement) control.hidden = total < 2;
    });
  };
  const openGallery = (button) => {
    if (!(dialog instanceof HTMLDialogElement) || typeof dialog.showModal !== "function") return false;
    const galleryButtons = buttons();
    const index = galleryButtons.indexOf(button);
    if (index < 0) return false;
    opener = button;
    renderDialog(index);
    if (!dialog.open) dialog.showModal();
    return true;
  };

  items().forEach((item) => {
    const thumbnail = item.querySelector("img");
    const button = item.querySelector("[data-gallery-open]");
    const removeIfBroken = () => removeFailedItem(item);
    thumbnail?.addEventListener("error", removeIfBroken, { once: true });
    if (thumbnail instanceof HTMLImageElement && thumbnail.complete && thumbnail.naturalWidth === 0) removeIfBroken();
    button?.addEventListener("click", (event) => {
      if (!(dialog instanceof HTMLDialogElement) || typeof dialog.showModal !== "function") return;
      event.preventDefault();
      openGallery(button);
    });
  });

  previousButton?.addEventListener("click", () => renderDialog(currentIndex - 1));
  nextButton?.addEventListener("click", () => renderDialog(currentIndex + 1));
  closeGalleryButton?.addEventListener("click", closeGallery);
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeGallery();
  });
  dialog?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      renderDialog(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      renderDialog(currentIndex + 1);
    }
  });
  dialog?.addEventListener("close", () => {
    if (opener?.isConnected) opener.focus();
    else {
      const fallback = focusFallback();
      if (fallback instanceof HTMLElement) fallback.focus();
    }
  });
  dialogImage?.addEventListener("error", () => {
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
    const failedItem = items()[currentIndex];
    removeFailedItem(failedItem);
    if (document.contains(gallery)) renderDialog(currentIndex);
  });
};

const initializeGalleries = (root = document) => {
  root.querySelectorAll?.("[data-gallery]").forEach(initializeGallery);
};

initializeGalleries();
document.addEventListener("miniutti:gallery-init", (event) => initializeGalleries(event.detail?.root || document));
