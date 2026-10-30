/**
 * Extension iOS qui dessine la Live Activity (écran verrouillé + Dynamic Island).
 * Générée dans le projet Xcode par @bacons/apple-targets à chaque prebuild.
 * @type {import('@bacons/apple-targets/app.plugin').ConfigFunction}
 */
module.exports = () => ({
  type: "widget",
  name: "PushPauseActivity",
  deploymentTarget: "16.2",
  frameworks: ["SwiftUI", "WidgetKit", "ActivityKit"],
});
