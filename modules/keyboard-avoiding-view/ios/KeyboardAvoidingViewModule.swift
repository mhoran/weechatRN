import ExpoModulesCore

public class KeyboardAvoidingViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("KeyboardAvoidingView")
    View(KeyboardAvoidingView.self) {}
    View(KeyboardAvoidingContentView.self) {}
  }
}
