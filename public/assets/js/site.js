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
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const leafConfigs = [
    { x: 7, drift: 5.5, phase: 0.04, duration: 17100, scale: 0.72, opacity: 0.42, rotation: -28, turns: 1.35 },
    { x: 22, drift: -7, phase: 0.71, duration: 19400, scale: 0.9, opacity: 0.48, rotation: 18, turns: -1.1 },
    { x: 39, drift: 8.5, phase: 0.37, duration: 15800, scale: 0.66, opacity: 0.38, rotation: 54, turns: 1.55 },
    { x: 56, drift: -6, phase: 0.86, duration: 20900, scale: 0.82, opacity: 0.44, rotation: -16, turns: -1.4 },
    { x: 70, drift: 7.5, phase: 0.2, duration: 18300, scale: 0.74, opacity: 0.4, rotation: 32, turns: 1.2 },
    { x: 84, drift: -5, phase: 0.55, duration: 22500, scale: 0.92, opacity: 0.46, rotation: -42, turns: -1.6 },
    { x: 95, drift: -8, phase: 0.94, duration: 16600, scale: 0.62, opacity: 0.36, rotation: 12, turns: 1.45 },
  ];
  const root = document.createElement("div");
  let bird = null;
  let leaves = [];
  let ambientFrame = 0;
  let startedAt = 0;
  let lastFrameAt = 0;
  let birdY = null;
  let wingPhase = 0;
  let destroyed = false;
  const pointer = { active: false, x: -1000, y: -1000 };

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
    bird.style.setProperty("--bird-x", "-16vw");
    bird.style.setProperty("--bird-y", "-16vh");
    bird.style.setProperty("--bird-direction", "1");
    root.append(bird);
  }

  leaves = leafConfigs.map((config, index) => {
    const element = document.createElement("span");
    element.className = "ambient-leaf";
    element.dataset.leafVariant = String(index % 6);
    root.append(element);
    return { ...config, element, gustX: 0, gustY: 0 };
  });

  document.body.append(root);

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
  const mix = (start, end, progress) => start + (end - start) * progress;
  const easeInOut = (progress) => 0.5 - Math.cos(Math.PI * progress) / 2;
  const fadeEdge = (progress, edge = 0.1) => clamp(Math.min(progress / edge, (1 - progress) / edge), 0, 1);

  const handlePointerMove = (event) => {
    if (!finePointer.matches || event.pointerType === "touch") return;
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };

  const clearPointer = () => {
    pointer.active = false;
  };

  const renderLeaves = (elapsed) => {
    const viewportWidth = Math.max(window.innerWidth, 1);
    const viewportHeight = Math.max(window.innerHeight, 1);
    leaves.forEach((leaf, index) => {
      const progress = ((elapsed / leaf.duration) + leaf.phase) % 1;
      const sway = Math.sin(progress * Math.PI * 2 + index * 0.82) * leaf.drift;
      const bow = Math.sin(progress * Math.PI) * leaf.drift * 0.72;
      const x = (leaf.x + sway + bow) / 100 * viewportWidth;
      const y = mix(-0.14 * viewportHeight, 1.14 * viewportHeight, progress);
      const distanceX = x - pointer.x;
      const distanceY = y - pointer.y;
      const distance = Math.hypot(distanceX, distanceY);
      let targetGustX = 0;
      let targetGustY = 0;

      if (pointer.active && distance > 0 && distance < 138) {
        const strength = (1 - distance / 138) ** 2;
        targetGustX = distanceX / distance * strength * 24;
        targetGustY = distanceY / distance * strength * 14;
      }

      leaf.gustX += (targetGustX - leaf.gustX) * 0.11;
      leaf.gustY += (targetGustY - leaf.gustY) * 0.11;
      const rotation = leaf.rotation + progress * 360 * leaf.turns
        + Math.sin(progress * Math.PI * 4 + index) * 15;
      const scale = leaf.scale * (0.96 + Math.sin(progress * Math.PI) * 0.08);
      leaf.element.style.opacity = String(leaf.opacity * fadeEdge(progress, 0.11));
      leaf.element.style.transform = `translate3d(${(x + leaf.gustX).toFixed(2)}px, ${(y + leaf.gustY).toFixed(2)}px, 0) translate(-50%, -50%) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    });
  };

  const birdTargetY = () => {
    const viewportHeight = Math.max(window.innerHeight, 1);
    let candidate = null;

    birdStops.forEach((stop, index) => {
      const heading = stop.matches("h1, h2") ? stop : stop.querySelector("h1, h2");
      const bounds = (heading instanceof HTMLElement ? heading : stop).getBoundingClientRect();
      if (bounds.bottom < 96 || bounds.top > viewportHeight - 96) return;
      const anchorY = bounds.top > 150 ? bounds.top - 54 : bounds.bottom + 48;
      const score = Math.abs(anchorY - viewportHeight * 0.42);
      if (!candidate || score < candidate.score) {
        candidate = { index, anchorY, score };
      }
    });

    if (!candidate || candidate.score > viewportHeight * 1.25) return null;
    return {
      stop: candidate.index,
      y: clamp(candidate.anchorY, 112, viewportHeight - 104),
    };
  };

  const renderBird = (elapsed, delta) => {
    if (!(bird instanceof HTMLElement)) return;
    const target = birdTargetY();
    if (!target) {
      bird.dataset.state = "hidden";
      bird.style.setProperty("--bird-opacity", "0");
      return;
    }

    birdY ??= target.y;
    birdY += (target.y - birdY) * Math.min(1, delta / 420);
    const cycle = (elapsed % 24000) / 24000;
    let progress = 0;
    let x = -12;
    let curve = 0;
    let direction = 1;
    let opacity = 0;
    let speed = 0;
    let state = "turning";

    if (cycle < 0.46) {
      progress = cycle / 0.46;
      const eased = easeInOut(progress);
      x = mix(-12, 112, eased);
      curve = -34 * Math.sin(Math.PI * progress) + 7 * Math.sin(Math.PI * progress * 2);
      opacity = fadeEdge(progress, 0.075);
      speed = Math.sin(Math.PI * progress);
      state = "flying-forward";
    } else if (cycle < 0.5) {
      x = 112;
      direction = -1;
    } else if (cycle < 0.96) {
      progress = (cycle - 0.5) / 0.46;
      const eased = easeInOut(progress);
      x = mix(112, -12, eased);
      curve = 28 * Math.sin(Math.PI * progress) - 6 * Math.sin(Math.PI * progress * 2);
      direction = -1;
      opacity = fadeEdge(progress, 0.075);
      speed = Math.sin(Math.PI * progress);
      state = "flying-return";
    }

    wingPhase += delta / 1000 * (4 + speed * 8);
    const pose = speed < 0.24 ? "glide" : (Math.sin(wingPhase) >= 0 ? "wing-up" : "wing-down");
    const rotation = direction * (-3.5 * Math.cos(Math.PI * progress) + 1.5 * Math.cos(Math.PI * progress * 2));
    bird.dataset.state = state;
    bird.dataset.pose = pose;
    bird.dataset.stopIndex = String(target.stop);
    bird.style.setProperty("--bird-opacity", opacity.toFixed(3));
    bird.style.setProperty("--bird-x", `${x.toFixed(2)}vw`);
    bird.style.setProperty("--bird-y", `${(birdY + curve).toFixed(2)}px`);
    bird.style.setProperty("--bird-rotation", `${rotation.toFixed(2)}deg`);
    bird.style.setProperty("--bird-direction", String(direction));
    bird.style.setProperty("--bird-scale", (0.88 + speed * 0.08).toFixed(3));
  };

  const renderAmbient = (now) => {
    if (destroyed) return;
    startedAt ||= now;
    lastFrameAt ||= now;
    const delta = Math.min(64, now - lastFrameAt);
    const elapsed = now - startedAt;
    lastFrameAt = now;
    renderLeaves(elapsed);
    renderBird(elapsed, delta);
    ambientFrame = requestAnimationFrame(renderAmbient);
  };

  const handleVisibility = () => {
    if (!document.hidden) lastFrameAt = performance.now();
  };

  if (finePointer.matches) {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", clearPointer);
  }
  document.addEventListener("visibilitychange", handleVisibility);
  ambientFrame = requestAnimationFrame(renderAmbient);

  return {
    destroy() {
      destroyed = true;
      if (ambientFrame) cancelAnimationFrame(ambientFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      root.remove();
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
