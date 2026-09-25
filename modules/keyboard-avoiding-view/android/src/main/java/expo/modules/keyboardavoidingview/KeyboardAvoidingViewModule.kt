package expo.modules.keyboardavoidingview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class KeyboardAvoidingViewModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("KeyboardAvoidingView")
        View(KeyboardAvoidingView::class) {}
        View(KeyboardAvoidingContentView::class) {}
    }
}
