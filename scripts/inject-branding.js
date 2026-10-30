// scripts/inject-branding.js
const fs = require("fs");
const path = require("path");

const platform = process.env.EAS_BUILD_PLATFORM;

function getIosProjectName() {
  const iosDir = "./ios";
  if (!fs.existsSync(iosDir)) return null;

  const files = fs.readdirSync(iosDir);
  const xcodeProj = files.find((f) => f.endsWith(".xcodeproj"));

  if (xcodeProj) {
    return xcodeProj.replace(".xcodeproj", "");
  }
  return null;
}

// ─────────────────────────────────────────
// ANDROID
// ─────────────────────────────────────────

const SOURCE_PATHS = {
  logoLight: "./assets/native/brand_logo_dark.png",
  logoDark: "./assets/native/brand_logo_dark.png",
};

const NAME = getIosProjectName();
if (!NAME) {
  console.log(
    "⚠️ [iOS] Impossible de déterminer le nom du projet iOS. Assurez-vous qu'il y a un fichier .xcodeproj dans le dossier ios/.",
  );
}

// ─────────────────────────────────────────
// ANDROID
// ─────────────────────────────────────────

function injectAndroid() {
  const projectRoot = process.cwd();
  const resDir = path.join(projectRoot, "android/app/src/main/res");

  if (!fs.existsSync(resDir)) {
    console.log(
      "❌ [Android] Dossier res non trouvé. Assurez-vous que le dossier /android existe.",
    );
    return;
  }

  // --- 1. Gestion des images (Light/Dark) ---
  const drawDir = path.join(resDir, "drawable");
  const nightDir = path.join(resDir, "drawable-night");

  try {
    if (!fs.existsSync(drawDir)) fs.mkdirSync(drawDir, { recursive: true });
    if (!fs.existsSync(nightDir)) fs.mkdirSync(nightDir, { recursive: true });

    fs.copyFileSync(
      path.join(projectRoot, SOURCE_PATHS.logoLight),
      path.join(drawDir, "brand_logo.png"),
    );
    fs.copyFileSync(
      path.join(projectRoot, SOURCE_PATHS.logoDark),
      path.join(nightDir, "brand_logo.png"),
    );
    console.log(
      "✅ [Android] Images de branding copiées (drawable & drawable-night).",
    );
  } catch (error) {
    console.error(
      "❌ [Android] Erreur lors de la copie des images:",
      error.message,
    );
  }

  // --- 2. Injection dans styles.xml ---
  // On scanne tous les dossiers de valeurs (values, values-night, values-v31, etc.)
  const valueDirs = fs
    .readdirSync(resDir)
    .filter((d) => d.startsWith("values"));

  valueDirs.forEach((dir) => {
    const stylesPath = path.join(resDir, dir, "styles.xml");

    if (fs.existsSync(stylesPath)) {
      let content = fs.readFileSync(stylesPath, "utf8");

      // Vérifier si le SplashScreen est présent dans ce fichier
      if (!content.includes("Theme.App.SplashScreen")) return;

      // Éviter les doublons
      if (content.includes("windowSplashScreenBrandingImage")) {
        console.log(
          `ℹ️ [Android] Branding déjà présent dans ${dir}/styles.xml`,
        );
        return;
      }

      // Ajouter l'espace de nom tools si nécessaire
      if (!content.includes("xmlns:tools=")) {
        content = content.replace(
          "<resources>",
          '<resources xmlns:tools="http://schemas.android.com/tools">',
        );
      }

      // Injection de l'item branding
      const replaced = content.replace(
        /(<style name="Theme\.App\.SplashScreen"[^>]*>)/,
        `$1\n        <item name="android:windowSplashScreenBrandingImage" tools:targetApi="31">@drawable/brand_logo</item>`,
      );

      if (replaced !== content) {
        fs.writeFileSync(stylesPath, replaced);
        console.log(`✅ [Android] Branding injecté dans ${dir}/styles.xml`);
      }
    }
  });
}

// ─────────────────────────────────────────
// IOS
// ─────────────────────────────────────────

function injectIos() {
  const iosDir = "./ios";

  if (!fs.existsSync(iosDir)) {
    console.log("⚠️ [iOS] Dossier ios/ non trouvé, skip.");
    return;
  }

  // 1. Recherche du fichier SplashScreen.storyboard
  let storyboardPath = null;
  const findStoryboard = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of files) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) findStoryboard(fullPath);
      else if (entry.name === "SplashScreen.storyboard")
        storyboardPath = fullPath;
    }
  };
  findStoryboard(iosDir);

  if (!storyboardPath) {
    console.log("❌ [iOS] SplashScreen.storyboard non trouvé");
    return;
  }

  let content = fs.readFileSync(storyboardPath, "utf8");

  // --- MODIFICATION DU STORYBOARD ---

  // 2. AJOUT DE LA RESSOURCE (L'étape que j'avais ratée)
  if (!content.includes('name="brand_logo"')) {
    const resourceReplacement =
      '        <image name="brand_logo" width="200" height="80"/>\n    </resources>';
    content = content.replace("</resources>", resourceReplacement);
  }

  // 3. INJECTION DE L'IMAGEVIEW ET DES CONTRAINTES
  if (!content.includes('id="BrandingLogo"')) {
    const safeAreaMatch = content.match(
      /viewLayoutGuide key="safeArea" id="([^"]+)"/,
    );
    const safeAreaId = safeAreaMatch ? safeAreaMatch[1] : "Rmq-lb-GrQ";

    // L'ImageView (Taille uniquement)
    const brandingImageView = `
                        <imageView id="BrandingLogo" userLabel="BrandingLogo" image="brand_logo" contentMode="scaleAspectFit" clipsSubviews="true" userInteractionEnabled="false" translatesAutoresizingMaskIntoConstraints="false">
                            <rect key="frame" x="96.5" y="738" width="200" height="80"/>
                            <constraints>
                                <constraint firstAttribute="height" constant="80" id="h-brand-height"/>
                                <constraint firstAttribute="width" constant="200" id="w-brand-width"/>
                            </constraints>
                        </imageView>`;

    // Les contraintes de POSITION (Centrage + Bottom)
    const brandingConstraints = `
                            <constraint firstItem="BrandingLogo" firstAttribute="centerX" secondItem="EXPO-ContainerView" secondAttribute="centerX" id="brand-x-center"/>
                            <constraint firstItem="${safeAreaId}" firstAttribute="bottom" secondItem="BrandingLogo" secondAttribute="bottom" constant="20" id="brand-bottom-margin"/>`;

    // Insertion de l'image dans subviews
    content = content.replace(
      "</subviews>",
      `${brandingImageView}\n                    </subviews>`,
    );

    // Insertion des contraintes de position dans le bloc global
    const constraintsEndMarker =
      /<\/constraints>\s*<color key="backgroundColor"/;
    if (constraintsEndMarker.test(content)) {
      content = content.replace(
        constraintsEndMarker,
        `${brandingConstraints}\n                    </constraints>\n                    <color key="backgroundColor"`,
      );
    } else {
      content = content.replace(
        "</constraints>",
        `${brandingConstraints}\n                    </constraints>`,
      );
    }

    // Sauvegarde immédiate du Storyboard
    fs.writeFileSync(storyboardPath, content);
    console.log(
      "✅ [iOS] Storyboard mis à jour (Ressource + Image + Position).",
    );
  }

  // --- GESTION DES ASSETS (DARK MODE) ---

  const xcassetsDir = `./ios/${NAME}/Images.xcassets`;
  if (xcassetsDir) {
    const imagesetDir = path.join(xcassetsDir, "brand_logo.imageset");
    if (!fs.existsSync(imagesetDir))
      fs.mkdirSync(imagesetDir, { recursive: true });

    if (fs.existsSync(SOURCE_PATHS.logoLight))
      fs.copyFileSync(
        SOURCE_PATHS.logoLight,
        path.join(imagesetDir, "brand_logo_light.png"),
      );
    if (fs.existsSync(SOURCE_PATHS.logoDark))
      fs.copyFileSync(
        SOURCE_PATHS.logoDark,
        path.join(imagesetDir, "brand_logo_dark.png"),
      );

    const contentsJson = {
      images: [
        { idiom: "universal", filename: "brand_logo_light.png", scale: "1x" },
        {
          idiom: "universal",
          appearances: [{ appearance: "luminosity", value: "dark" }],
          filename: "brand_logo_dark.png",
          scale: "1x",
        },
        { idiom: "universal", scale: "2x" },
        {
          idiom: "universal",
          appearances: [{ appearance: "luminosity", value: "dark" }],
          scale: "2x",
        },
        { idiom: "universal", scale: "3x" },
        {
          idiom: "universal",
          appearances: [{ appearance: "luminosity", value: "dark" }],
          scale: "3x",
        },
      ],
      info: { version: 1, author: "xcode" },
    };
    fs.writeFileSync(
      path.join(imagesetDir, "Contents.json"),
      JSON.stringify(contentsJson, null, 2),
    );
    console.log("✅ [iOS] Assets configurés.");
  }
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────

if (!platform || platform === "android") injectAndroid();
if (!platform || platform === "ios") injectIos();
