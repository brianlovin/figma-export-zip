const { selection } = figma.currentPage

function hasValidSelection(nodes) {
  return !(!nodes || nodes.length === 0)
}

export interface ExportableBytes {
  name: string;
  setting: ExportSettingsImage | ExportSettingsPDF | ExportSettingsSVG;
  bytes: Uint8Array;
}

async function main(nodes): Promise<string> {
  if (!hasValidSelection(selection)) return Promise.resolve("Nothing selected for export")

  let exportableBytes: ExportableBytes[] = []
  for (let node of nodes) {
    let { name, exportSettings } = node
    if (exportSettings.length === 0) {
      exportSettings = [{ format: "PNG", suffix: '', constraint: { type: "SCALE", value: 1 }, contentsOnly: true }]
    }

    for (let setting of exportSettings) {
      let defaultSetting = setting
      const bytes = await node.exportAsync(defaultSetting)
      exportableBytes.push({
        name,
        setting,
        bytes,
      })
    }
  }

  figma.showUI(__html__, { visible: false })
  figma.ui.postMessage({ exportableBytes })

  return new Promise(res => {
    figma.ui.onmessage = () => res()
  })
}

main(selection).then(res => figma.closePlugin(res))