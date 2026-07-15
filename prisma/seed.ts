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
    thumbnail: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=70",
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
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=70",
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
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=70",
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
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=70",
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
    thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=70",
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
    thumbnail: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&q=70",
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

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: "studio@motionhub.dev" },
    update: {},
    create: { email: "studio@motionhub.dev", name: "MotionHub Studio" },
  });

  for (const d of demos) {
    await prisma.demo.upsert({
      where: { slug: d.slug },
      update: d,
      create: {
        ...d,
        authorId: d.source === "original" ? demo.id : null,
      },
    });
  }
  console.log(`Seeded ${demos.length} demos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
