import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample data so the gallery is populated before you run the crawler.
// - "original" demos carry real, copy-ready AI prompts (some premium).
// - "codrops"/"motionsites" demos are attribution examples: free, link back
//   to a source. The real crawler fills these in for real.
const demos = [
  {
    slug: "aurora-gradient-hero",
    titleEn: "Aurora Gradient Hero",
    titleZh: "极光渐变首屏",
    summaryEn: "A silky animated mesh-gradient hero background that drifts like the northern lights.",
    summaryZh: "如极光般缓缓流动的网格渐变首屏背景，丝滑不刺眼。",
    tags: "gradient,hero,canvas,background",
    thumbnail: "/thumbs/aurora-gradient-hero.svg",
    liveUrl: "",
    source: "original",
    sourceName: "MotionHub",
    isPremium: false,
    priceCents: 0,
    promptEn:
      "Build a full-screen hero background in a single HTML file using a WebGL fragment shader. Render a slowly drifting aurora-style mesh gradient with 4 color stops (deep indigo, violet, teal, soft pink). Animate with time-based simplex noise so the colors flow like the northern lights, ~0.05 speed. Add a subtle grain overlay. Respect prefers-reduced-motion by freezing the animation. No external libraries.",
    promptZh:
      "用单个 HTML 文件、WebGL 片元着色器做一个全屏首屏背景：4 个色标（深靛蓝、紫罗兰、青绿、柔粉）的网格渐变，用基于时间的 simplex 噪声让颜色像极光一样缓缓流动，速度约 0.05，叠加轻微颗粒噪点。当 prefers-reduced-motion 时冻结动画。不依赖任何外部库。",
  },
  {
    slug: "magnetic-cursor-buttons",
    titleEn: "Magnetic Cursor Buttons",
    titleZh: "磁吸光标按钮",
    summaryEn: "Buttons that attract the cursor with spring physics and a gooey highlight.",
    summaryZh: "带弹簧物理的磁吸按钮，光标靠近即被吸附，配黏稠高光。",
    tags: "interaction,cursor,spring,micro",
    thumbnail: "/thumbs/magnetic-cursor-buttons.svg",
    liveUrl: "",
    source: "original",
    sourceName: "MotionHub",
    isPremium: true,
    priceCents: 500,
    promptEn:
      "Create a 'magnetic button' component in vanilla JS. On pointermove within 80px, translate the button toward the cursor by up to 12px using a spring (stiffness 0.15, damping 0.75) via requestAnimationFrame. The inner label lags slightly behind the button for depth. On pointerleave, spring back to origin. Add a soft radial highlight that follows the cursor inside the button. Keyboard-focusable and reduced-motion aware.",
    promptZh:
      "用原生 JS 写一个「磁吸按钮」组件：指针在 80px 内移动时，按钮用弹簧（刚度 0.15、阻尼 0.75）向光标平移最多 12px，用 requestAnimationFrame 驱动；内部文字比按钮略微滞后产生层次；指针离开时弹回原位；按钮内有跟随光标的柔和径向高光。支持键盘聚焦，遵守 reduced-motion。",
  },
  {
    slug: "infinite-marquee-3d",
    titleEn: "Infinite 3D Marquee",
    titleZh: "无限 3D 跑马灯",
    summaryEn: "A seamless looping marquee of cards tilted in 3D that speeds up as you scroll.",
    summaryZh: "无缝循环的 3D 倾斜卡片跑马灯，随滚动加速。",
    tags: "scroll,3d,marquee,cards",
    thumbnail: "/thumbs/infinite-marquee-3d.svg",
    liveUrl: "",
    source: "original",
    sourceName: "MotionHub",
    isPremium: true,
    priceCents: 800,
    promptEn:
      "Build a horizontal infinite marquee of image cards using CSS transforms and JS. Cards sit on a perspective plane (perspective: 1200px) rotated ~18deg on Y. The row scrolls left continuously; wheel/scroll velocity adds to the base speed with easing decay. Duplicate the card set for a seamless loop. Cards nearest center are largest and least blurred (parallax by depth). Pause on hover.",
    promptZh:
      "用 CSS 变换 + JS 做一条水平无限跑马灯：图片卡片放在 perspective:1200px 的透视平面上、绕 Y 轴旋转约 18°，整行持续向左滚动；滚轮/滚动速度叠加到基础速度上并带缓动衰减；复制一组卡片实现无缝循环；越靠中间的卡片越大越清晰（按深度做视差）；悬停暂停。",
  },
  {
    slug: "text-scramble-reveal",
    titleEn: "Text Scramble Reveal",
    titleZh: "乱码解码标题",
    summaryEn: "Headlines that decode from random glyphs into the final text on view.",
    summaryZh: "标题从随机字符「解码」成最终文字，进入视口即触发。",
    tags: "text,reveal,typography,intersection",
    thumbnail: "/thumbs/text-scramble-reveal.svg",
    liveUrl: "",
    source: "original",
    sourceName: "MotionHub",
    isPremium: false,
    priceCents: 0,
    promptEn:
      "Write a vanilla-JS text scramble effect. Given an element, animate each character from random glyphs (!<>-_\\/[]{}=+*^?#) to its final letter, staggered left-to-right over ~1.2s with easing. Trigger via IntersectionObserver when 40% visible, once. Provide a data-scramble attribute API so any element opts in. Respect prefers-reduced-motion (show final text instantly).",
    promptZh:
      "用原生 JS 写文字乱码解码效果：对某元素，每个字符从随机字符（!<>-_\\/[]{}=+*^?#）解码为最终字母，从左到右错峰约 1.2s，带缓动；用 IntersectionObserver 在可见 40% 时触发一次；通过 data-scramble 属性让任意元素接入；遵守 prefers-reduced-motion（直接显示最终文字）。",
  },
  {
    slug: "codrops-example-webgl-slideshow",
    titleEn: "WebGL Image Slideshow (Codrops example)",
    titleZh: "WebGL 图片幻灯（Codrops 示例）",
    summaryEn: "Attribution example — a distortion slideshow curated from Codrops. Links to the original.",
    summaryZh: "注明出处示例——精选自 Codrops 的扭曲转场幻灯，链接回原作。",
    tags: "webgl,slideshow,shader",
    thumbnail: "/thumbs/codrops-example-webgl-slideshow.svg",
    liveUrl: "https://tympanus.net/codrops/",
    source: "codrops",
    sourceName: "Codrops",
    sourceUrl: "https://tympanus.net/codrops/hub/",
    license: "© original author on Codrops. Attributed; the link points to the original work.",
    isPremium: false,
    priceCents: 0,
    promptEn: "",
    promptZh: "",
  },
  {
    slug: "motionsites-example-hover-grid",
    titleEn: "Hover-reveal Portfolio Grid (motionsites example)",
    titleZh: "悬停揭示作品网格（motionsites 示例）",
    summaryEn: "Attribution example — a hover-driven grid curated from motionsites.ai. Links to the original.",
    summaryZh: "注明出处示例——精选自 motionsites.ai 的悬停网格，链接回原作。",
    tags: "grid,hover,portfolio",
    thumbnail: "/thumbs/motionsites-example-hover-grid.svg",
    liveUrl: "https://motionsites.ai/",
    source: "motionsites",
    sourceName: "motionsites.ai",
    sourceUrl: "https://motionsites.ai/",
    license: "© original author. Attributed; the link points to the original work.",
    isPremium: false,
    priceCents: 0,
    promptEn: "",
    promptZh: "",
  },
];

// Real demos gathered from Codrops (title + original link). Free & attributed —
// the crawler produces exactly this shape; these are checked-in examples so a
// fresh `npm run setup` already shows real content. Run `npm run crawl` to add more.
const CODROPS_LICENSE = "© original author on Codrops. Attributed; the link points to the original work.";
const crawledCodrops = [
  ["cr-scroll-gallery", "Scroll-Revealed WebGL Gallery", "滚动揭示的 WebGL 画廊",
    "A multi-page WebGL image gallery with scroll-triggered shader reveals and seamless page transitions (GSAP · Three.js · Astro · Barba.js).",
    "多页 WebGL 图片画廊，滚动触发着色器揭示 + 无缝翻页转场（GSAP · Three.js · Astro · Barba.js）。",
    "webgl,scroll,three.js", "https://tympanus.net/codrops/2026/02/02/building-a-scroll-revealed-webgl-gallery-with-gsap-three-js-astro-and-barba-js/"],
  ["cr-3d-mood", "Scroll-Reactive 3D Gallery", "随滚动反应的 3D 画廊",
    "A scroll-driven WebGL gallery with depth-layered images, palette-driven backgrounds, and motion that responds to scroll velocity.",
    "滚动驱动的 WebGL 画廊，图片按深度分层、背景随色板变化、动态响应滚动速度。",
    "three.js,3d,scroll", "https://tympanus.net/codrops/2026/03/09/building-a-scroll-reactive-3d-gallery-with-three-js-velocity-and-mood-based-backgrounds/"],
  ["cr-blender-path", "Blender Camera-Path 3D Gallery", "Blender 相机路径 3D 画廊",
    "A cinematic, scroll-driven 3D gallery flying along a camera path authored in Blender, rendered with Three.js and animated with GSAP.",
    "电影感的滚动 3D 画廊，沿 Blender 里做的相机路径穿行，Three.js 渲染、GSAP 驱动。",
    "three.js,blender,scroll", "https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/"],
  ["cr-image-tube", "Scroll-Driven 3D Image Tube", "滚动驱动的 3D 图片隧道",
    "Shader-based deformation, inertial motion, deterministic looping and synced DOM overlays for a tactile WebGL tube (React Three Fiber).",
    "着色器形变 + 惯性运动 + 确定性循环 + DOM 覆层同步，做出有质感的 WebGL 图片隧道（R3F）。",
    "r3f,shader,scroll", "https://tympanus.net/codrops/2026/02/17/reactive-depth-building-a-scroll-driven-3d-image-tube-with-react-three-fiber/"],
  ["cr-cinematic", "Cinematic 3D Scroll with GSAP", "GSAP 电影感 3D 滚动",
    "How to build cinematic, story-like 3D scroll experiences driven entirely by GSAP timelines.",
    "用 GSAP 时间线做出电影般、有叙事感的 3D 滚动体验。",
    "gsap,3d,scroll", "https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/"],
  ["cr-sticky-grid", "Sticky Grid Scroll", "粘性网格滚动",
    "A scroll-driven animated grid where every transition is designed for clear, fluid visual storytelling.",
    "滚动驱动的动画网格，每一次过渡都为清晰流畅的视觉叙事而设计。",
    "grid,scroll,gsap", "https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/"],
  ["cr-gooey", "Gooey Image Hover Effects", "黏稠图片悬停效果",
    "Gooey reveal hover effects on images with Three.js — using shader noise to melt one image into another on hover.",
    "用 Three.js 做黏稠揭示悬停：着色器噪声让一张图在悬停时「化」成另一张。",
    "hover,three.js,gooey", "https://tympanus.net/codrops/2019/10/23/making-gooey-image-hover-effects-with-three-js/"],
  ["cr-distortion", "WebGL Distortion Hover", "WebGL 扭曲悬停",
    "A small library for WebGL-powered distortion hover effects, transitioning between images using displacement maps.",
    "一个小库：用位移贴图做 WebGL 扭曲悬停，在两张图之间做位移转场。",
    "hover,distortion,webgl", "https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/"],
  ["cr-bulge", "Bulge Distortion Effect", "凸起扭曲效果",
    "A fun bulge/magnify distortion in WebGL using the OGL library and a custom fragment shader.",
    "用 OGL 库 + 自定义片元着色器做的凸起/放大扭曲效果，趣味十足。",
    "distortion,ogl,shader", "https://tympanus.net/codrops/2023/06/28/creating-a-bulge-distortion-effect-with-webgl/"],
  ["cr-rgb-shift", "Grid Displacement + RGB Shift", "网格位移 + RGB 偏移",
    "Pixel/grid displacement on a texture in Three.js using GPGPU shaders, with a subtle RGB shift on cursor move.",
    "用 Three.js GPGPU 着色器对纹理做像素/网格位移，光标移动时带轻微 RGB 偏移。",
    "shader,gpgpu,rgb", "https://tympanus.net/codrops/2024/08/27/grid-displacement-texture-with-rgb-shift-using-three-js-gpgpu-and-shaders/"],
  ["cr-product-grid", "Animated Product Grid Preview", "动画产品网格预览",
    "A 'grid to preview' hover interaction that transforms product cards into a full preview using GSAP and clip-path.",
    "「网格 → 预览」悬停交互：用 GSAP + clip-path 把产品卡片展开成整屏预览。",
    "grid,gsap,clip-path", "https://tympanus.net/codrops/2025/05/27/animated-product-grid-preview-with-gsap-clip-path/"],
  ["cr-flip", "Grid Layout Transitions (GSAP Flip)", "网格布局过渡（GSAP Flip）",
    "Interactive, button-triggered responsive grid layout transitions built with the GSAP Flip plugin and CSS Grid.",
    "用 GSAP Flip 插件 + CSS Grid 做的、按钮触发的响应式网格布局过渡。",
    "grid,gsap,flip", "https://tympanus.net/codrops/2026/01/20/animating-responsive-grid-layout-transitions-with-gsap-flip/"],
  ["cr-parallax", "Infinite Parallax Grid", "无限视差网格",
    "An infinite, draggable parallax grid with seamless tiling, built with GSAP.",
    "用 GSAP 做的无限、可拖拽视差网格，无缝平铺。",
    "grid,parallax,gsap", "https://tympanus.net/codrops/2025/06/11/building-an-infinite-parallax-grid-with-gsap-and-seamless-tiling/"],
  ["cr-draggable", "Draggable Product Grid", "可拖拽产品网格",
    "A recreation of Palmer's draggable product grid — inertial dragging and snapping with GSAP.",
    "复刻 Palmer 的可拖拽产品网格：GSAP 惯性拖拽 + 吸附。",
    "drag,grid,gsap", "https://tympanus.net/codrops/2025/09/01/recreating-palmers-draggable-product-grid-with-gsap/"],
].map(([slug, titleEn, titleZh, summaryEn, summaryZh, tags, sourceUrl]) => ({
  slug,
  titleEn,
  titleZh,
  summaryEn,
  summaryZh,
  tags,
  thumbnail: "", // real crawler fills the original thumbnail; empty shows a placeholder
  liveUrl: sourceUrl,
  source: "codrops",
  sourceName: "Codrops",
  sourceUrl,
  license: CODROPS_LICENSE,
  isPremium: false,
  priceCents: 0,
  promptEn: "",
  promptZh: "",
}));

// Showcase: full landing-hero effects that run live in the app via an <iframe>
// pointing at the self-contained page in /public/showcase. Each carries the exact
// build prompt so the copy-prompt entry works.
const showcase = [
  {
    slug: "toonhub-carousel",
    titleEn: "TOONHUB Figurine Carousel",
    titleZh: "TOONHUB 手办轮播",
    summaryEn: "A full-screen character carousel: arrows rotate roles while background, scale and blur crossfade in 650ms.",
    summaryZh: "全屏角色轮播：方向键切换，背景/缩放/模糊在 650ms 内一起淡变。",
    tags: "carousel,3d,hero",
    liveUrl: "/showcase/toonhub.html",
    isPremium: false,
    priceCents: 0,
    promptEn:
      "Build a single full-viewport hero carousel called 'TOONHUB' in React + TypeScript + Vite + Tailwind, icons from lucide-react.\n\n4 items, each with an image src and two colors (bg / panel): #F4845F/#F79B7F, #6BBF7A/#85CC92, #E882B4/#ED9DC4, #6EB5FF/#8DC4FF. Preload all 4 images on mount via new Image().\n\nState: activeIndex 0-3, isAnimating lock, isMobile (window.innerWidth < 640, update on resize). navigate(next|prev): ignore while animating; set lock; activeIndex = (i+1)%4 or (i+3)%4; release after 650ms. Roles from activeIndex: center=i, left=(i+3)%4, right=(i+1)%4, back=(i+2)%4.\n\nOuter div backgroundColor = active bg, transition background-color 650ms cubic-bezier(0.4,0,0.2,1), Inter font. Inner 100vh.\n- Grain overlay: SVG fractalNoise data URI (baseFrequency 0.9, numOctaves 4), container opacity 0.4, backgroundSize 200px, zIndex 50.\n- Ghost text '3D SHAPE' centered, Anton font, fontSize clamp(90px,28vw,380px), weight 900, white, uppercase, top 18%, zIndex 2.\n- Top-left brand 'TOONHUB', text-xs semibold uppercase, letterSpacing 0.18em.\n- Carousel zIndex 3: each item position absolute, aspectRatio 0.6/1, img objectFit contain, objectPosition bottom center. center: translateX(-50%) scale(1.68/1.25 mobile), no blur, opacity 1, left 50%, height 92%/60%, bottom 0/22%. left: scale 1, blur 2px, opacity 0.85, left 30%/20%, height 28%/16%, bottom 12%/32%. right = left at left 70%/80%. back: scale 1, blur 4px, opacity 1, left 50%, height 22%/13%, bottom 12%/32%. Transition transform/filter/opacity/left over 650ms cubic-bezier(0.4,0,0.2,1).\n- Bottom-left: 'TOONHUB FIGURINES' bold uppercase; a paragraph hidden on mobile; two 48/64px circular buttons (2px white border, transparent, ArrowLeft/ArrowRight size 26) calling navigate.\n- Bottom-right 'DISCOVER IT' Anton clamp(20px,4vw,56px) white uppercase + ArrowRight.\n\nBehavior: arrows rotate roles; background, positions, scales, blurs and opacities all crossfade together over 650ms.",
    promptZh:
      "用 React + TypeScript + Vite + Tailwind + lucide-react 做全屏英雄区手办轮播 TOONHUB。4 个 item，每个含图片与两种颜色（bg/panel）：#F4845F/#F79B7F、#6BBF7A/#85CC92、#E882B4/#ED9DC4、#6EB5FF/#8DC4FF，挂载时预加载。状态 activeIndex、动画锁、isMobile(<640)。navigate 切换 (i±1)%4，650ms 内锁定。角色 center/left/right/back 由 activeIndex 推导。外层背景色=当前 bg，随 650ms cubic-bezier(.4,0,.2,1) 过渡。巨型幽灵文字 '3D SHAPE'（Anton，clamp(90,28vw,380)）。轮播每项 aspect .6/1，按角色设置 translateX(-50%)+scale、blur、opacity、left、height、bottom，同一 650ms 缓动同时切换。左下 'TOONHUB FIGURINES' + 两个圆形箭头按钮，右下 'DISCOVER IT'。",
  },
  {
    slug: "measured-spotlight",
    titleEn: "Measured — Spotlight Reveal",
    titleZh: "Measured 光标聚光揭示",
    summaryEn: "A dark hero where a cursor spotlight reveals a moving video over a parallax grid and a giant serif title.",
    summaryZh: "深色首屏：光标聚光揭示下方运动视频，叠加视差网格与巨型衬线标题。",
    tags: "spotlight,cursor,hero",
    liveUrl: "/showcase/measured.html",
    isPremium: true,
    priceCents: 600,
    promptEn:
      "Build a fullscreen (100vh) dark hero for a wearable product 'Measured' in React + Vite + Tailwind + TS.\n\nFonts: Inter global; Instrument Serif for the hero word 'Measured'; a self-hosted Helvetica Neue via @font-face.\nLayers (z order): grid background (z0, opacity 0.1, 48px cells, L-path stroke #64748b 0.6, parallax-shifts with cursor: offset = cursorFromCenter * 16 eased 0.06); background image bg-cover (z10); hero text 'Measured' Instrument Serif, text-[4.5rem] up to lg:text-[16rem], leading-[0.9], white, top-20..32 (z20); semi-transparent overlay PNG w-full h-full object-cover pointer-events-none (z25); spotlight reveal (z30).\n\nSpotlight: a cursor-following radial reveal, radius 260px, mask gradient stops white 0-40%, 0.75 at 60%, 0.4 at 75%, 0.12 at 88%, 0 at 100%. Draw the gradient at the smoothed cursor pos to a hidden canvas, export dataURL, apply as CSS mask-image on a div containing an autoplay muted loop playsInline video. Cursor smoothing: rAF lerp 0.1 (smooth += (target-smooth)*0.1). The video is clipped to the bottom 60% via clipPath inset(40% 0 0 0), so only the lower part reveals.\n\nNav (z50, fixed): white geometric SVG logo top-left; center frosted 'liquid-glass' pill with Device / Real Stories / Science / Plans / Reach Us; top-right liquid-glass 'Reserve Yours' with a green dot; mobile hamburger + fullscreen menu with staggered slide-up entries (60ms increments, cubic-bezier(0.77,0,0.18,1)).\n\nliquid-glass: background rgba(255,255,255,0.01), backdrop-filter blur(4px), inset box-shadow, and a border-only gradient via ::before with mask-composite exclude.",
    promptZh:
      "用 React + Vite + Tailwind + TS 做穿戴产品 'Measured' 的全屏(100vh)深色英雄区。字体 Inter 全局、Instrument Serif 用于标题、自托管 Helvetica Neue。分层：48px 视差网格(z0,opacity .1，偏移=光标离中心*16，缓动0.06)；背景图 bg-cover(z10)；巨型衬线标题 'Measured'(z20)；半透明叠加 PNG(z25)；聚光揭示(z30)。聚光：跟随光标的径向遮罩，半径260px，白 0-40%→.75@60%→.4@75%→.12@88%→0@100%，把渐变画到隐藏 canvas 导出 dataURL 作为 CSS mask，光标用 rAF lerp 0.1 平滑；下方视频 autoplay/muted/loop/playsInline，用 clipPath inset(40% 0 0 0) 只露下 60%。导航：白色几何 logo、中间磨砂 liquid-glass 胶囊菜单、右上 'Reserve Yours' 带绿点、移动端全屏菜单错峰滑入。liquid-glass：极淡背景 + blur(4px) + ::before 用 mask-composite exclude 做描边渐变。",
  },
  {
    slug: "foldcraft-video-hero",
    titleEn: "Foldcraft — Video Hero",
    titleZh: "Foldcraft 视频首屏",
    summaryEn: "A cinematic video hero with a frosted navbar and staggered fade-slide-up hero copy.",
    summaryZh: "电影感视频首屏 + 磨砂导航 + 逐条淡入上滑的标题文案。",
    tags: "hero,video,landing",
    liveUrl: "/showcase/foldcraft.html",
    isPremium: false,
    priceCents: 0,
    promptEn:
      "Create a fullscreen (100vh) hero for a creative studio 'Foldcraft' in React + Tailwind + lucide-react.\n\nBackground: a looping mp4 (autoPlay muted loop playsInline), absolute full width/height, object-cover, object-position 70% center, behind all content. Font: Google Geist (300-700), applied as font-geist; body antialiased.\nRoot: relative h-screen w-full overflow-hidden bg-black font-geist.\n\nNavbar (z30): flex space-between, px-6 py-5 (md:px-12 lg:px-16). Left: logo 'Foldcraft' (text-lg font-semibold tracking-tight text-white sm:text-xl) + desktop links Home/Projects/Studio/Reach Us (text-sm text-white/80 hover:text-white). Right desktop: 'Let's Talk' (rounded-lg bg-white px-5 py-2 text-black hover:scale-105). Right mobile: hamburger toggle (40x40, z50) with animated Menu/X lucide icons (rotate 90deg + opacity + scale, duration-300).\n\nMobile menu (z20): absolute inset-x-0 top-0, bg-black/98 backdrop-blur-xl, transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] between h-screen opacity-100 and h-0 opacity-0; centered links text-3xl and a 'Let's Talk' pill.\n\nHero content (z10): flex column justify-between, h-[calc(100vh-80px)], px-6 pb-10 pt-12 (md scale up). Top (max-w-3xl): badge 'Brand & Visual Storytelling' with animate fadeSlideUp 0.8s ease 0.2s both; h1 'Shaping visual / narratives, / one pixel at a time.' with <br>, text-3xl..lg:text-7xl, font-medium leading-[1.1] tracking-tight text-white, fadeSlideUp delay 0.4s. Bottom: paragraph 'Turning vision into reality through craft, motion, and an endless pursuit of beauty.' (text-white/60, fadeSlideUp 0.7s) and CTA 'Explore Work' + ArrowRight (rounded-lg bg-white text-black hover:scale-105, fadeSlideUp 0.9s).\n\n@keyframes fadeSlideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }",
    promptZh:
      "用 React + Tailwind + lucide-react 做创意工作室 'Foldcraft' 的全屏(100vh)首屏。背景：循环 mp4(autoPlay/muted/loop/playsInline)，绝对全屏 object-cover、object-position 70% center，位于所有内容之下。字体 Google Geist，font-geist。根容器 relative h-screen w-full overflow-hidden bg-black。导航(z30)：左侧 logo 'Foldcraft' + 桌面链接 Home/Projects/Studio/Reach Us，右侧 'Let's Talk' 白底按钮；移动端汉堡按钮用 lucide Menu/X 旋转切换。移动菜单(z20)：全屏 bg-black/98 backdrop-blur-xl，duration-500 ease cubic-bezier(0.16,1,0.3,1)。英雄内容(z10)：徽章 + h1 'Shaping visual / narratives, / one pixel at a time.' + 段落 + 'Explore Work→' 按钮，全部 fadeSlideUp，延迟 0.2/0.4/0.7/0.9s 错峰淡入上滑。",
  },
].map((d) => ({
  thumbnail: "",
  source: "original",
  sourceName: "MotionHub",
  sourceUrl: "",
  license: "",
  ...d,
}));

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: "studio@motionhub.dev" },
    update: {},
    create: { email: "studio@motionhub.dev", name: "MotionHub Studio" },
  });

  const all = [...demos, ...showcase, ...crawledCodrops];
  for (const d of all) {
    await prisma.demo.upsert({
      where: { slug: d.slug },
      update: d,
      create: {
        ...d,
        authorId: d.source === "original" ? demo.id : null,
      },
    });
  }
  console.log(`Seeded ${all.length} demos (${showcase.length} live showcase, ${crawledCodrops.length} crawled).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
