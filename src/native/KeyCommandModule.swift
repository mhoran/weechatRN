internal import ExpoModulesCore

class KeyCommandModule: Module {
  public func definition() -> ModuleDefinition {
    View(KeyCommandView.self) {
      Events("onShiftEnter", "onTab")
    }
  }
}
